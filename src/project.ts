import syncFs from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { renderThunked } from "@lit-labs/ssr";
import createJiti from "jiti";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import MarkdownIt from "markdown-it";

import { html as orisonHtml } from "./html";

type JsonRecord = Record<string, any>;

type OrisonLoaderDefinition = {
  loader: (...args: any[]) => any;
  name: string;
};

export type OrisonOptions = {
  buildDir?: string;
  dataFileBasename?: string;
  excludedPaths?: string[];
  fragmentName?: string;
  generatePath?: string;
  generateSlugs?: string[];
  layoutFileBasename?: string;
  loaders?: OrisonLoaderDefinition[];
  pagesDirectory?: string;
  port?: number;
  protectedFileNames?: string[];
  rootPath?: string;
  srcDirectory?: string;
  staticDirectory?: string;
};

type ResolvedOptions = Required<
  Pick<
    OrisonOptions,
    | "dataFileBasename"
    | "excludedPaths"
    | "fragmentName"
    | "generatePath"
    | "generateSlugs"
    | "layoutFileBasename"
    | "loaders"
    | "pagesDirectory"
    | "port"
    | "protectedFileNames"
    | "rootPath"
    | "srcDirectory"
    | "staticDirectory"
  >
> & {
  buildDir: string;
  outputRoot: string;
  pagesRoot: string;
  sourceRoot: string;
};

type DirectoryNode = {
  children: DirectoryNode[];
  data: JsonRecord;
  localData: JsonRecord;
  name: string;
  parent: DirectoryNode | null;
  parents: DirectoryNode[];
  path: string;
  relativePath: string;
  sourcePath: string;
};

type PageDefinition = {
  directory: DirectoryNode;
  kind: "file" | "list";
  name: string;
  relativePath: string;
  routeBase: string;
  sourcePath: string;
  sourcePathFromPagesRoot: string;
};

type RenderedOutput = {
  body: string;
  contentType: "application/json" | "text/html";
  outputPath: string;
  routePath: string;
};

type RenderedRoute = {
  content: string;
  contentType: "application/json" | "text/html";
  statusCode: number;
};

type BuildResult = {
  files: string[];
  pages: string[];
};

type PageRuntime = {
  html: string;
  routePath: string;
};

type PageContext = {
  children: DirectoryNode[];
  data: JsonRecord;
  loaders: Record<string, (...args: any[]) => Promise<any>>;
  local: DirectoryNode;
  mdFile: (filePath: string) => unknown;
  mdString: (markdown: string) => unknown;
  page: {
    html: unknown;
    path: string;
    routePath: string;
  };
  parent: DirectoryNode | null;
  parents: DirectoryNode[];
  path: string;
  root: DirectoryNode;
};

const AsyncFunction = Object.getPrototypeOf(async function () {
  return undefined;
}).constructor as new (
  ...args: string[]
) => (...runtimeArgs: any[]) => Promise<any>;

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
    const site = await this.inspectSite();
    process.env.ORISON_PROJECT_ROOT = this.options.rootPath;
    const outputs = await this.renderBuildOutputs(site.tree);

    await this.copyStaticDirectory();
    await Promise.all(outputs.map((output) => this.writeOutput(output)));

    return {
      files: outputs.map((output) => output.outputPath),
      pages: outputs
        .filter((output) => output.contentType === "text/html")
        .map((output) => output.routePath),
    };
  }

  async renderRequest(routePath: string): Promise<RenderedRoute | null> {
    const site = await this.inspectSite();
    process.env.ORISON_PROJECT_ROOT = this.options.rootPath;
    const normalized = normalizeRequestedRoute(
      routePath,
      this.options.fragmentName,
    );

    const publicOutput = isPublicDataRoute(normalized.routePath)
      ? this.getPublicOutputForRoute(site.tree, normalized.routePath)
      : null;
    if (publicOutput) {
      return {
        content: JSON.stringify(publicOutput, null, 2),
        contentType: "application/json",
        statusCode: 200,
      };
    }

    const directPage = site.pages.find((page) =>
      this.matchesDirectRoute(page, normalized.routePath),
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
      .sort((left, right) =>
        right.directory.relativePath.length - left.directory.relativePath.length,
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

  private async evaluateHtmlTemplate(sourcePath: string, context: PageContext) {
    const source = await fs.readFile(sourcePath, "utf8");
    const escaped = source.replaceAll("\\", "\\\\").replaceAll("`", "\\`");
    const templateFactory = new AsyncFunction(
      "context",
      "html",
      `return html\`${escaped}\`;`,
    );
    return templateFactory(context, orisonHtml);
  }

  private getPublicOutputForRoute(
    directory: DirectoryNode,
    routePath: string,
  ): JsonRecord | null {
    if (
      directory.path === normalizeDirectoryPathFromRoute(routePath) &&
      directory.localData.public
    ) {
      return directory.localData.public;
    }

    for (const child of directory.children) {
      const childResult = this.getPublicOutputForRoute(child, routePath);
      if (childResult) {
        return childResult;
      }
    }

    return null;
  }

  private async inspectSite() {
    const tree = await this.readDirectoryTree("", null);
    const pages = await this.collectPages(tree);
    return { pages, tree };
  }

  private matchesDirectRoute(page: PageDefinition, routePath: string) {
    return this.getDirectRoutes(page).includes(routePath);
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

  private async readDirectoryTree(
    relativePath: string,
    parent: DirectoryNode | null,
  ): Promise<DirectoryNode> {
    const sourcePath = path.join(this.options.pagesRoot, relativePath);
    const localDataPath = path.join(
      sourcePath,
      `${this.options.dataFileBasename}.json`,
    );
    const localData = (await exists(localDataPath))
      ? JSON.parse(await fs.readFile(localDataPath, "utf8"))
      : {};
    const relativeUrlPath = relativePath ? `/${toPosix(relativePath)}` : "/";
    const directory: DirectoryNode = {
      children: [],
      data: deepMerge(parent?.data ?? {}, localData),
      localData,
      name: path.basename(sourcePath),
      parent,
      parents: parent ? [...parent.parents, parent] : [],
      path: relativeUrlPath,
      relativePath,
      sourcePath,
    };

    const entries = await fs.readdir(sourcePath, { withFileTypes: true });
    const childDirectories = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) =>
          this.readDirectoryTree(
            path.join(relativePath, entry.name),
            directory,
          ),
        ),
    );

    directory.children = childDirectories.sort(compareDirectories);
    return directory;
  }

  private async collectPages(
    directory: DirectoryNode,
  ): Promise<PageDefinition[]> {
    const entries = await fs.readdir(directory.sourcePath, {
      withFileTypes: true,
    });
    const localPages = entries
      .filter((entry) => entry.isFile())
      .filter((entry) => /\.(?:html|js|ts)$/.test(entry.name))
      .filter((entry) => entry.name !== `${this.options.layoutFileBasename}.js`)
      .filter((entry) => entry.name !== `${this.options.layoutFileBasename}.ts`)
      .map<PageDefinition>((entry) => {
        const sourcePath = path.join(directory.sourcePath, entry.name);
        const relativePath = directory.relativePath
          ? path.join(directory.relativePath, entry.name)
          : entry.name;
        const basename = path.basename(entry.name, path.extname(entry.name));
        return {
          directory,
          kind: basename === "list" ? "list" : "file",
          name: basename,
          relativePath: toPosix(relativePath),
          routeBase: directory.path,
          sourcePath,
          sourcePathFromPagesRoot: toPosix(relativePath),
        };
      });

    const childPages = await Promise.all(
      directory.children.map((child) => this.collectPages(child)),
    );
    return [...localPages, ...childPages.flat()];
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

    const pages = await this.collectPages(root);
    for (const page of pages) {
      if (page.kind === "list") {
        outputs.push(...(await this.renderListOutputs(root, page)));
      } else {
        const routes = this.getDirectRoutes(page);
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
            ...this.createHtmlOutputs(
              routePath,
              runtime.routePath,
              runtime.html,
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
              outputPath: this.getFragmentOutputPath(routePath),
              routePath: this.getFragmentRoute(routePath),
            });
          }
        }
      }
    }

    outputs.push(...this.createPublicOutputs(root));
    return dedupeOutputs(outputs);
  }

  private createHtmlOutputs(
    routePath: string,
    canonicalRoutePath: string,
    html: string,
  ): RenderedOutput[] {
    return [
      {
        body: html,
        contentType: "text/html",
        outputPath: this.getOutputPathForRoute(routePath),
        routePath: canonicalRoutePath,
      },
    ];
  }

  private createPublicOutputs(directory: DirectoryNode): RenderedOutput[] {
    const outputs: RenderedOutput[] = [];
    if (directory.localData.public) {
      outputs.push({
        body: JSON.stringify(directory.localData.public, null, 2),
        contentType: "application/json",
        outputPath: path.join(
          this.options.outputRoot,
          directory.relativePath,
          "data.json",
        ),
        routePath:
          directory.path === "/" ? "/data.json" : `${directory.path}/data.json`,
      });
    }

    for (const child of directory.children) {
      outputs.push(...this.createPublicOutputs(child));
    }

    return outputs;
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
        outputPath: this.getOutputPathForRoute(itemRoute),
        routePath: itemRoute,
      });
      outputs.push({
        body: fragmentHtml,
        contentType: "text/html",
        outputPath: this.getFragmentOutputPath(itemRoute),
        routePath: this.getFragmentRoute(itemRoute),
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
      const htmlTemplate = await this.evaluateHtmlTemplate(
        page.sourcePath,
        context,
      );
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

  private getDirectRoutes(page: PageDefinition) {
    if (page.kind === "list") {
      return [];
    }

    if (page.name === "index") {
      if (page.directory.relativePath === "") {
        return ["/"];
      }
      return [
        `/${toPosix(page.directory.relativePath)}`,
        `/${toPosix(page.directory.relativePath)}.html`,
      ];
    }

    const prefix = page.directory.relativePath
      ? `/${toPosix(page.directory.relativePath)}/`
      : "/";
    return [`${prefix}${page.name}.html`];
  }

  private getFragmentOutputPath(routePath: string) {
    return this.getOutputPathForRoute(this.getFragmentRoute(routePath));
  }

  private getFragmentRoute(routePath: string) {
    if (routePath === "/") {
      return `/index.${this.options.fragmentName}.html`;
    }

    if (routePath.endsWith(".html")) {
      return routePath.replace(/\.html$/, `.${this.options.fragmentName}.html`);
    }

    return `${routePath}/index.${this.options.fragmentName}.html`;
  }

  private getOutputPathForRoute(routePath: string) {
    if (routePath === "/") {
      return path.join(this.options.outputRoot, "index.html");
    }

    const relativeRoute = routePath.replace(/^\//, "");
    if (!path.extname(relativeRoute)) {
      return path.join(this.options.outputRoot, relativeRoute, "index.html");
    }

    return path.join(this.options.outputRoot, relativeRoute);
  }

  private async writeOutput(output: RenderedOutput) {
    await fs.mkdir(path.dirname(output.outputPath), { recursive: true });
    await fs.writeFile(output.outputPath, output.body, "utf8");
  }
}

function buildListItemRoute(page: PageDefinition, name: string) {
  const prefix = page.directory.relativePath
    ? `/${toPosix(page.directory.relativePath)}/`
    : "/";
  return `${prefix}${name}.html`;
}

function camelCase(value: string) {
  return value.replace(/[-_](.)/g, (_, character: string) =>
    character.toUpperCase(),
  );
}

function compareDirectories(left: DirectoryNode, right: DirectoryNode) {
  const leftOrder = Number(left.data.orison?.order ?? Number.MAX_SAFE_INTEGER);
  const rightOrder = Number(
    right.data.orison?.order ?? Number.MAX_SAFE_INTEGER,
  );
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }
  return left.name.localeCompare(right.name);
}

function dedupeOutputs(outputs: RenderedOutput[]) {
  const seen = new Map<string, RenderedOutput>();
  for (const output of outputs) {
    seen.set(output.outputPath, output);
  }
  return [...seen.values()];
}

function deepMerge(base: JsonRecord, override: JsonRecord): JsonRecord {
  const result: JsonRecord = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(result[key])) {
      result[key] = deepMerge(result[key], value as JsonRecord);
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function exists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function getParents(directory: DirectoryNode) {
  const parents: DirectoryNode[] = [];
  let current = directory.parent;
  while (current) {
    parents.unshift(current);
    current = current.parent;
  }
  return parents;
}

function getSlugFromListRoute(page: PageDefinition, routePath: string) {
  const normalized = routePath.replace(/\.html$/, "").replace(/\/$/, "");
  const segments = normalized.split("/").filter(Boolean);
  const pageSegments = page.directory.relativePath
    .split(path.sep)
    .filter(Boolean);
  return segments.slice(pageSegments.length).join("/");
}

function isMissingModuleError(error: unknown): error is { code: string } {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return (error as { code: string }).code === "MODULE_NOT_FOUND";
}

function isPublicDataRoute(routePath: string) {
  return routePath === "/data.json" || routePath.endsWith("/data.json");
}

async function resolveExistingModulePath(resolvedPath: string) {
  const candidates = [
    resolvedPath,
    `${resolvedPath}.js`,
    `${resolvedPath}.ts`,
    `${resolvedPath}.json`,
    path.join(resolvedPath, "index.js"),
    path.join(resolvedPath, "index.ts"),
  ];

  for (const candidate of candidates) {
    if (await exists(candidate)) {
      return candidate;
    }
  }

  return null;
}

function isListRouteMatch(page: PageDefinition, routePath: string) {
  const prefix = page.directory.relativePath
    ? `/${toPosix(page.directory.relativePath)}/`
    : "/";
  return routePath.startsWith(prefix) && routePath.endsWith(".html");
}

function isPlainObject(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeDirectoryPathFromRoute(routePath: string) {
  if (routePath === "/data.json") {
    return "/";
  }

  return routePath.replace(/\/data\.json$/, "").replace(/\.html$/, "");
}

function normalizeListItems(rawItems: any, slug?: string) {
  if (!rawItems) {
    return [];
  }

  const items = Array.isArray(rawItems) ? rawItems : [rawItems];
  return items.filter(
    (item) =>
      item && typeof item.name === "string" && (!slug || item.name === slug),
  );
}

function normalizeRequestedRoute(routePath: string, fragmentName: string) {
  if (routePath.endsWith(`.${fragmentName}.html`)) {
    if (routePath === `/index.${fragmentName}.html`) {
      return { fragmentOnly: true, routePath: "/" };
    }

    if (routePath.endsWith(`/index.${fragmentName}.html`)) {
      return {
        fragmentOnly: true,
        routePath:
          routePath.replace(
            new RegExp(`/index\\.${fragmentName}\\.html$`),
            "",
          ) || "/",
      };
    }

    return {
      fragmentOnly: true,
      routePath: routePath.replace(
        new RegExp(`\\.${fragmentName}\\.html$`),
        ".html",
      ),
    };
  }

  return {
    fragmentOnly: false,
    routePath: routePath === "" ? "/" : routePath,
  };
}

async function renderUnknown(value: unknown): Promise<string> {
  if (value === null || value === undefined || value === false) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const chunks = await Promise.all(value.map(renderUnknown));
    return chunks.join("");
  }

  return collectResult(renderThunked(value));
}

function requireFromPackage(specifier: string) {
  return require(specifier);
}

function resolveOptions(options: OrisonOptions): ResolvedOptions {
  const rootPath = path.resolve(options.rootPath ?? process.cwd());
  const defaultBuildDir = path.join(rootPath, "dist");
  const sourceRoot = requireFromPackage("node:fs").existsSync(
    path.join(
      rootPath,
      options.srcDirectory ?? "src",
      options.pagesDirectory ?? "pages",
    ),
  )
    ? path.join(rootPath, options.srcDirectory ?? "src")
    : rootPath;
  return {
    buildDir: options.buildDir
      ? path.resolve(rootPath, options.buildDir)
      : defaultBuildDir,
    dataFileBasename: options.dataFileBasename ?? "data",
    excludedPaths: options.excludedPaths ?? [],
    fragmentName: options.fragmentName ?? "fragment",
    generatePath: options.generatePath ?? "/",
    generateSlugs: options.generateSlugs ?? [],
    layoutFileBasename: options.layoutFileBasename ?? "layout",
    loaders: options.loaders ?? [],
    outputRoot: options.buildDir
      ? path.resolve(rootPath, options.buildDir)
      : defaultBuildDir,
    pagesDirectory: options.pagesDirectory ?? "pages",
    pagesRoot: path.join(sourceRoot, options.pagesDirectory ?? "pages"),
    port: options.port ?? 3000,
    protectedFileNames: options.protectedFileNames ?? [
      "pages",
      "partials",
      "loaders",
      "static",
    ],
    rootPath,
    sourceRoot,
    srcDirectory: options.srcDirectory ?? "src",
    staticDirectory: options.staticDirectory ?? "static",
  };
}

function stableStringify(value: unknown) {
  return JSON.stringify(value, (_, currentValue) => {
    if (isPlainObject(currentValue)) {
      return Object.fromEntries(
        Object.entries(currentValue).sort(([left], [right]) =>
          left.localeCompare(right),
        ),
      );
    }
    return currentValue;
  });
}

function toPosix(targetPath: string) {
  return targetPath.split(path.sep).join("/");
}

async function walkFiles(rootPath: string): Promise<string[]> {
  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(rootPath, entry.name);
      if (entry.isDirectory()) {
        return walkFiles(entryPath);
      }
      return [entryPath];
    }),
  );
  return files.flat();
}
