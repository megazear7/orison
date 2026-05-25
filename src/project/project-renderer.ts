import syncFs from "node:fs";
import path from "node:path";

import { unsafeHTML } from "lit/directives/unsafe-html.js";
import type MarkdownIt from "markdown-it";

import type { ProjectModuleLoader } from "./module-loader";
import { evaluateHtmlTemplate, renderUnknown } from "./render";
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
import {
  collectPages,
  createPublicOutputs,
  getPublicOutputForRoute,
} from "./site";
import { getParents, getSlugFromListRoute, toPosix } from "./utils";
import type {
  DirectoryNode,
  PageContext,
  PageDefinition,
  PageRuntime,
  RenderedOutput,
  RenderedRoute,
  ResolvedOptions,
  SiteState,
} from "./types";

export class ProjectRenderer {
  constructor(
    private readonly options: ResolvedOptions,
    private readonly markdown: MarkdownIt,
    private readonly moduleLoader: ProjectModuleLoader,
  ) {}

  async renderBuildOutputs(root: DirectoryNode) {
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
    return outputs;
  }

  async renderRequest(
    site: SiteState,
    routePath: string,
  ): Promise<RenderedRoute | null> {
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

  private async createContext(
    root: DirectoryNode,
    directory: DirectoryNode,
    page: PageDefinition,
    routePath: string,
    fragmentHtml: string,
    loaderCache: Map<string, Promise<unknown>>,
  ): Promise<PageContext> {
    const loaderMap = await this.moduleLoader.loadLoaders(
      this.options.loaders,
      loaderCache,
    );
    return {
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
              this.moduleLoader.resolveProjectFilePath(page, filePath),
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
    const loaderCache = new Map<string, Promise<unknown>>();
    const pageModule = await this.moduleLoader.loadCallableModule(
      page.sourcePath,
      `list page module ${page.sourcePath}`,
    );
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
    const items = normalizeListItems(rawItems, slug, page.sourcePath);
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
      return matched
        ? {
            html: matched.body,
            outputs,
          }
        : null;
    }

    return { outputs };
  }

  private async renderPageDefinition(
    root: DirectoryNode,
    page: PageDefinition,
    routePath: string,
    fragmentOnly: boolean,
  ): Promise<PageRuntime | null> {
    const loaderCache = new Map<string, Promise<unknown>>();
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
    loaderCache: Map<string, Promise<unknown>>,
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

    const pageModule = await this.moduleLoader.loadCallableModule(
      page.sourcePath,
      `page module ${page.sourcePath}`,
    );
    const result = await pageModule(context);
    return renderUnknown(result);
  }

  private async wrapWithLayout(
    root: DirectoryNode,
    page: PageDefinition,
    context: PageContext,
    fragmentHtml: string,
  ) {
    const layoutPath = await this.moduleLoader.resolveLayoutPath(
      page.directory,
      this.options.layoutFileBasename,
    );
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

    const layoutModule = await this.moduleLoader.loadCallableModule(
      layoutPath,
      `layout module ${layoutPath}`,
    );
    const layoutResult = await layoutModule(layoutContext);
    return renderUnknown(layoutResult);
  }
}
