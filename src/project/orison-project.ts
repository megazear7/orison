import syncFs from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import createJiti from "jiti";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import MarkdownIt from "markdown-it";

import { resolveOptions, requireFromPackage } from "./options";
import {
  buildListItemRoute,
  createHtmlOutputs,
  getDirectRoutes,
  getFragmentOutputPath,
  getFragmentRoute,
  getOutputPathForRoute,
  isListRouteMatch,
  isPublicDataRoute,
  normalizeListItems,
  normalizeRequestedRoute,
} from "./routes";
import { evaluateHtmlTemplate, renderUnknown } from "./render";
import {
  collectPages,
  createPublicOutputs,
  getPublicOutputForRoute,
  inspectSite,
} from "./site";
import {
  camelCase,
  countDirectories,
  dedupeOutputs,
  exists,
  formatByteSize,
  getParents,
  getSlugFromListRoute,
  isMissingModuleError,
  resolveExistingModulePath,
  stableStringify,
  toPosix,
  walkFiles,
} from "./utils";
import type {
  BuildResult,
  DirectoryNode,
  OrisonLoaderDefinition,
  OrisonOptions,
  PageContext,
  PageDefinition,
  PageRuntime,
  RenderedOutput,
  RenderedRoute,
  ResolvedOptions,
} from "./types";

export class OrisonProject {
  private readonly markdown = new MarkdownIt();

  private readonly options: ResolvedOptions;

  constructor(options: OrisonOptions = {}) {
    this.options = resolveOptions(options);
  }

  get staticRoot() {
    return path.join(this.options.sourceRoot, this.options.staticDirectory);
  }

  async build(): Promise<BuildResult> {
    const startedAt = Date.now();
    this.logBuild(
      `starting build in ${this.relativeToRoot(this.options.rootPath)}`,
    );
    this.logBuild(`pages root: ${this.relativeToRoot(this.options.pagesRoot)}`);
    this.logBuild(
      `output root: ${this.relativeToRoot(this.options.outputRoot)}`,
    );

    this.logBuild("inspecting site structure");
    const site = await inspectSite(this.options);
    const staticFiles = await this.getStaticFiles();

    this.logBuild(
      `discovered ${countDirectories(site.tree)} directories and ${site.pages.length} page definitions`,
    );
    this.logPageDefinitions(site.pages);
    if (staticFiles.length === 0) {
      this.logBuild("no static assets found");
    } else {
      this.logBuild(`found ${staticFiles.length} static asset files`);
      this.logStaticFiles(staticFiles);
    }

    process.env.ORISON_PROJECT_ROOT = this.options.rootPath;

    this.logBuild("rendering build outputs");
    const outputs = await this.renderBuildOutputs(site.tree);
    this.logBuild(`prepared ${outputs.length} output files`);
    this.logRenderedOutputs(outputs);

    this.logBuild("copying static assets");
    await this.copyStaticDirectory();

    this.logBuild("writing rendered outputs");
    await Promise.all(outputs.map((output) => this.writeOutput(output)));

    const elapsedMs = Date.now() - startedAt;
    this.logBuild(`build completed in ${elapsedMs}ms`);

    return {
      files: outputs.map((output) => output.outputPath),
      pages: outputs
        .filter((output) => output.contentType === "text/html")
        .map((output) => output.routePath),
    };
  }

  async renderRequest(routePath: string): Promise<RenderedRoute | null> {
    const site = await inspectSite(this.options);
    process.env.ORISON_PROJECT_ROOT = this.options.rootPath;
    const normalized = normalizeRequestedRoute(
      routePath,
      this.options.fragmentName,
    );

    const publicOutput = isPublicDataRoute(normalized.routePath)
      ? getPublicOutputForRoute(site.tree, normalized.routePath)
      : null;
    if (publicOutput) {
      return {
        content: JSON.stringify(publicOutput, null, 2),
        contentType: "application/json",
        statusCode: 200,
      };
    }

    const directPage = site.pages.find((page) =>
      getDirectRoutes(page).includes(normalized.routePath),
    );
    if (directPage) {
      const runtime = await this.renderPageDefinition(
        site.tree,
        directPage,
        normalized.routePath,
        normalized.fragmentOnly,
      );
      if (runtime) {
        return {
          content: runtime.html,
          contentType: "text/html",
          statusCode: normalized.routePath === "/404.html" ? 404 : 200,
        };
      }
    }

    const listPage = site.pages
      .filter(
        (page) =>
          page.kind === "list" && isListRouteMatch(page, normalized.routePath),
      )
      .sort(
        (left, right) =>
          right.directory.relativePath.length -
          left.directory.relativePath.length,
      )[0];
    if (listPage) {
      const runtime = await this.renderListPage(
        site.tree,
        listPage,
        normalized.routePath,
        normalized.fragmentOnly,
        true,
      );
      if (runtime?.html) {
        return {
          content: runtime.html,
          contentType: "text/html",
          statusCode: 200,
        };
      }
    }

    const notFoundPage = site.pages.find(
      (page) =>
        page.relativePath === "404.html" || page.relativePath === "404.js",
    );
    if (!notFoundPage) {
      return null;
    }

    const runtime = await this.renderPageDefinition(
      site.tree,
      notFoundPage,
      "/404.html",
      normalized.fragmentOnly,
    );
    if (!runtime) {
      return null;
    }

    return {
      content: runtime.html,
      contentType: "text/html",
      statusCode: 404,
    };
  }

  get port() {
    return this.options.port;
  }

  get outputRoot() {
    return this.options.outputRoot;
  }

  private logBuild(message: string) {
    console.info(`[orison:build] ${message}`);
  }

  private logPageDefinitions(pages: PageDefinition[]) {
    for (const page of pages) {
      if (page.kind === "list") {
        this.logBuild(
          `page list ${this.relativeToRoot(page.sourcePath)} -> dynamic routes under ${page.routeBase}`,
        );
        continue;
      }

      const routes = getDirectRoutes(page);
      this.logBuild(
        `page file ${this.relativeToRoot(page.sourcePath)} -> ${routes.join(", ")}`,
      );
    }
  }

  private logRenderedOutputs(outputs: RenderedOutput[]) {
    for (const output of outputs) {
      this.logBuild(
        `output ${output.contentType} ${output.routePath} -> ${this.relativeToRoot(output.outputPath)} (${formatByteSize(output.body.length)})`,
      );
    }
  }

  private logStaticFiles(filePaths: string[]) {
    for (const filePath of filePaths) {
      this.logBuild(`static asset ${this.relativeToRoot(filePath)}`);
    }
  }

  private async getStaticFiles() {
    if (!(await exists(this.staticRoot))) {
      return [];
    }

    return walkFiles(this.staticRoot);
  }

  private relativeToRoot(targetPath: string) {
    const relativePath = path.relative(this.options.rootPath, targetPath);
    if (relativePath === "") {
      return ".";
    }

    return toPosix(relativePath);
  }

  private async copyStaticDirectory() {
    if (!(await exists(this.staticRoot))) {
      return;
    }

    await fs.cp(this.staticRoot, this.options.outputRoot, {
      force: true,
      recursive: true,
    });
  }

  private async createContext(
    root: DirectoryNode,
    directory: DirectoryNode,
    page: PageDefinition,
    routePath: string,
    fragmentHtml: string,
    loaderCache: Map<string, Promise<any>>,
  ): Promise<PageContext> {
    const loaderMap = await this.loadLoaders(loaderCache);
    const pageContext: PageContext = {
      children: directory.children,
      data: directory.data,
      loaders: new Proxy(loaderMap, {
        get(target, property) {
          if (typeof property !== "string") {
            return undefined;
          }

          if (property in target) {
            return target[property];
          }

          return async (message: unknown) =>
            `Message from programatic loader: ${String(message)}`;
        },
      }) as PageContext["loaders"],
      local: directory,
      mdFile: (filePath) =>
        unsafeHTML(
          this.markdown.render(
            syncFs.readFileSync(
              this.resolveProjectFilePath(page, filePath),
              "utf8",
            ),
          ),
        ),
      mdString: (markdown) => unsafeHTML(this.markdown.render(markdown)),
      page: {
        html: fragmentHtml,
        path: `/${toPosix(page.sourcePathFromPagesRoot)}`,
        routePath,
      },
      parent: directory.parent,
      parents: getParents(directory),
      path: routePath,
      root,
    };

    return pageContext;
  }

  private async loadLoaders(loaderCache: Map<string, Promise<any>>) {
    const jiti = this.createJiti();
    const loadersDirectory = path.join(this.options.sourceRoot, "loaders");
    const fileLoaders = (await exists(loadersDirectory))
      ? await walkFiles(loadersDirectory)
      : [];
    const loaderEntries: OrisonLoaderDefinition[] = [
      ...this.options.loaders,
      ...(await Promise.all(
        fileLoaders
          .filter((filePath) => /\.(?:[cm]?js|ts)$/.test(filePath))
          .map(async (filePath) => ({
            loader: await this.loadModuleDefault(jiti, filePath),
            name: camelCase(path.basename(filePath, path.extname(filePath))),
          })),
      )),
    ];

    return Object.fromEntries(
      loaderEntries.map((entry) => [
        entry.name,
        async (...args: any[]) => {
          const cacheKey = `${entry.name}:${stableStringify(args)}`;
          if (!loaderCache.has(cacheKey)) {
            loaderCache.set(cacheKey, Promise.resolve(entry.loader(...args)));
          }
          return loaderCache.get(cacheKey);
        },
      ]),
    );
  }

  private async loadModuleDefault(
    jiti: ReturnType<typeof createJiti>,
    filePath: string,
  ) {
    let loaded: any;
    try {
      loaded = await jiti.import(filePath);
    } catch (error) {
      if (!isMissingModuleError(error)) {
        throw error;
      }

      const transformedModulePath =
        await this.writeCompatibilityModule(filePath);
      loaded = await jiti.import(transformedModulePath);
    }

    return loaded && typeof loaded === "object" && "default" in loaded
      ? loaded.default
      : loaded;
  }

  private createJiti() {
    return createJiti(__filename, {
      fsCache: false,
      interopDefault: true,
      moduleCache: process.env.NODE_ENV === "production",
    });
  }

  private async renderBuildOutputs(root: DirectoryNode) {
    const outputs: RenderedOutput[] = [];

    const pages = await collectPages(this.options, root);
    for (const page of pages) {
      if (page.kind === "list") {
        outputs.push(...(await this.renderListOutputs(root, page)));
      } else {
        const routes = getDirectRoutes(page);
        for (const routePath of routes) {
          const runtime = await this.renderPageDefinition(
            root,
            page,
            routePath,
            false,
          );
          if (!runtime) {
            continue;
          }
          outputs.push(
            ...createHtmlOutputs(
              routePath,
              runtime.routePath,
              runtime.html,
              this.options.outputRoot,
            ),
          );

          const fragmentRuntime = await this.renderPageDefinition(
            root,
            page,
            routePath,
            true,
          );
          if (fragmentRuntime) {
            outputs.push({
              body: fragmentRuntime.html,
              contentType: "text/html",
              outputPath: getFragmentOutputPath(
                routePath,
                this.options.outputRoot,
                this.options.fragmentName,
              ),
              routePath: getFragmentRoute(routePath, this.options.fragmentName),
            });
          }
        }
      }
    }

    outputs.push(...createPublicOutputs(this.options, root));
    return dedupeOutputs(outputs);
  }

  private async renderListOutputs(root: DirectoryNode, page: PageDefinition) {
    const listResult = await this.renderListPage(
      root,
      page,
      page.routeBase,
      false,
      false,
    );
    if (!listResult) {
      return [];
    }

    return listResult.outputs;
  }

  private async renderListPage(
    root: DirectoryNode,
    page: PageDefinition,
    routePath: string,
    fragmentOnly: boolean,
    servingSingleSlug: boolean,
  ): Promise<{
    html?: string;
    outputs: RenderedOutput[];
  } | null> {
    const jiti = this.createJiti();
    const loaderCache = new Map<string, Promise<any>>();
    const pageModule = await this.loadModuleDefault(jiti, page.sourcePath);
    const slug = servingSingleSlug
      ? getSlugFromListRoute(page, routePath)
      : undefined;
    const initialContext = await this.createContext(
      root,
      page.directory,
      page,
      routePath,
      "",
      loaderCache,
    );
    const rawItems = await pageModule(initialContext, slug);
    const items = normalizeListItems(rawItems, slug);
    if (servingSingleSlug && items.length === 0) {
      return null;
    }

    const outputs: RenderedOutput[] = [];
    for (const item of items) {
      const itemRoute = buildListItemRoute(page, item.name);
      const itemContext = await this.createContext(
        root,
        page.directory,
        page,
        itemRoute,
        "",
        loaderCache,
      );
      const fragmentHtml = await renderUnknown(item.html);
      itemContext.page.html = fragmentHtml;
      const fullHtml = fragmentOnly
        ? fragmentHtml
        : await this.wrapWithLayout(root, page, itemContext, fragmentHtml);
      outputs.push({
        body: fullHtml,
        contentType: "text/html",
        outputPath: getOutputPathForRoute(itemRoute, this.options.outputRoot),
        routePath: itemRoute,
      });
      outputs.push({
        body: fragmentHtml,
        contentType: "text/html",
        outputPath: getFragmentOutputPath(
          itemRoute,
          this.options.outputRoot,
          this.options.fragmentName,
        ),
        routePath: getFragmentRoute(itemRoute, this.options.fragmentName),
      });
    }

    if (servingSingleSlug) {
      const matched = outputs.find((output) => output.routePath === routePath);
      return {
        html: matched?.body,
        outputs,
      };
    }

    return { outputs };
  }

  private async renderPageDefinition(
    root: DirectoryNode,
    page: PageDefinition,
    routePath: string,
    fragmentOnly: boolean,
  ): Promise<PageRuntime | null> {
    const loaderCache = new Map<string, Promise<any>>();
    const fragmentHtml = await this.renderPageFragment(
      root,
      page,
      routePath,
      loaderCache,
    );
    if (fragmentHtml === null) {
      return null;
    }

    if (fragmentOnly) {
      return {
        html: fragmentHtml,
        routePath,
      };
    }

    const context = await this.createContext(
      root,
      page.directory,
      page,
      routePath,
      fragmentHtml,
      loaderCache,
    );
    const html = await this.wrapWithLayout(root, page, context, fragmentHtml);
    return {
      html,
      routePath,
    };
  }

  private async renderPageFragment(
    root: DirectoryNode,
    page: PageDefinition,
    routePath: string,
    loaderCache: Map<string, Promise<any>>,
  ): Promise<string | null> {
    const context = await this.createContext(
      root,
      page.directory,
      page,
      routePath,
      "",
      loaderCache,
    );
    if (path.extname(page.sourcePath) === ".html") {
      const htmlTemplate = await evaluateHtmlTemplate(page.sourcePath, context);
      return renderUnknown(htmlTemplate);
    }

    const jiti = this.createJiti();
    const pageModule = await this.loadModuleDefault(jiti, page.sourcePath);
    const result = await pageModule(context);
    return renderUnknown(result);
  }

  private resolveProjectFilePath(page: PageDefinition, candidatePath: string) {
    const tries = [
      path.resolve(path.dirname(page.sourcePath), candidatePath),
      path.resolve(this.options.rootPath, candidatePath),
      path.resolve(this.options.sourceRoot, candidatePath),
      path.resolve(
        this.options.rootPath,
        candidatePath.replace(/^\.\/src\//, "./"),
      ),
      path.resolve(
        this.options.sourceRoot,
        candidatePath.replace(/^\.\/src\//, "./"),
      ),
    ];

    const resolved = tries.find((candidate) =>
      requireFromPackage("node:fs").existsSync(candidate),
    );
    if (!resolved) {
      throw new Error(`Unable to resolve file path: ${candidatePath}`);
    }

    return resolved;
  }

  private async wrapWithLayout(
    root: DirectoryNode,
    page: PageDefinition,
    context: PageContext,
    fragmentHtml: string,
  ) {
    const layoutPath = await this.resolveLayoutPath(page.directory);
    if (!layoutPath) {
      return fragmentHtml;
    }

    const layoutContext = await this.createContext(
      root,
      page.directory,
      page,
      context.path,
      fragmentHtml,
      new Map(),
    );
    layoutContext.page.html = unsafeHTML(fragmentHtml);

    const jiti = this.createJiti();
    const layoutModule = await this.loadModuleDefault(jiti, layoutPath);
    const layoutResult = await layoutModule(layoutContext);
    return renderUnknown(layoutResult);
  }

  private async resolveLayoutPath(
    directory: DirectoryNode,
  ): Promise<string | null> {
    let current: DirectoryNode | null = directory;
    while (current) {
      for (const extension of [".js", ".ts"]) {
        const candidate = path.join(
          current.sourcePath,
          `${this.options.layoutFileBasename}${extension}`,
        );
        if (await exists(candidate)) {
          return candidate;
        }
      }
      current = current.parent;
    }

    return null;
  }

  private async rewriteImportSpecifier(
    importerPath: string,
    specifier: string,
  ) {
    if (specifier === "orison") {
      return path.resolve(__dirname, "./orison.js");
    }

    if (!specifier.startsWith(".")) {
      return specifier;
    }

    const resolved = path.resolve(path.dirname(importerPath), specifier);
    const resolvedWithExtension = await resolveExistingModulePath(resolved);
    if (resolvedWithExtension) {
      return resolvedWithExtension;
    }

    return specifier;
  }

  private async writeCompatibilityModule(filePath: string) {
    const source = await fs.readFile(filePath, "utf8");
    const transformed = await this.rewriteModuleImports(filePath, source);
    const compatibilityPath = path.join(
      os.tmpdir(),
      "orison-cache",
      path.relative(this.options.rootPath, filePath),
    );

    await fs.mkdir(path.dirname(compatibilityPath), { recursive: true });
    await fs.writeFile(compatibilityPath, transformed, "utf8");

    return compatibilityPath;
  }

  private async rewriteModuleImports(filePath: string, source: string) {
    const importMatches = [...source.matchAll(/(from\s+['"])([^'"]+)(['"])/g)];
    let transformed = source;

    for (const match of importMatches) {
      const original = match[2];
      if (!original) {
        continue;
      }
      const rewritten = await this.rewriteImportSpecifier(filePath, original);
      transformed = transformed.replace(
        match[0],
        `${match[1]}${rewritten}${match[3]}`,
      );
    }

    const requireMatches = [
      ...transformed.matchAll(/(require\(\s*['"])([^'"]+)(['"]\s*\))/g),
    ];
    for (const match of requireMatches) {
      const original = match[2];
      if (!original) {
        continue;
      }
      const rewritten = await this.rewriteImportSpecifier(filePath, original);
      transformed = transformed.replace(
        match[0],
        `${match[1]}${rewritten}${match[3]}`,
      );
    }

    return transformed;
  }

  private async writeOutput(output: RenderedOutput) {
    await fs.mkdir(path.dirname(output.outputPath), { recursive: true });
    await fs.writeFile(output.outputPath, output.body, "utf8");
  }
}
