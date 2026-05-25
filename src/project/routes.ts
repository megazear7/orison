import path from "node:path";

import { parseListPageItems } from "./schemas";
import { toPosix } from "./utils";
import type { ListPageItem, PageDefinition, RenderedOutput } from "./types";

export function buildListItemRoute(page: PageDefinition, name: string) {
  const prefix = page.directory.relativePath
    ? `/${toPosix(page.directory.relativePath)}/`
    : "/";
  return `${prefix}${name}.html`;
}

export function createHtmlOutputs(
  routePath: string,
  canonicalRoutePath: string,
  html: string,
  outputRoot: string,
): RenderedOutput[] {
  return [
    {
      body: html,
      contentType: "text/html",
      outputPath: getOutputPathForRoute(routePath, outputRoot),
      routePath: canonicalRoutePath,
    },
  ];
}

export function getDirectRoutes(page: PageDefinition) {
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

export function getFragmentOutputPath(
  routePath: string,
  outputRoot: string,
  fragmentName: string,
) {
  return getOutputPathForRoute(
    getFragmentRoute(routePath, fragmentName),
    outputRoot,
  );
}

export function getFragmentRoute(routePath: string, fragmentName: string) {
  if (routePath === "/") {
    return `/index.${fragmentName}.html`;
  }

  if (routePath.endsWith(".html")) {
    return routePath.replace(/\.html$/, `.${fragmentName}.html`);
  }

  return `${routePath}/index.${fragmentName}.html`;
}

export function getOutputPathForRoute(routePath: string, outputRoot: string) {
  if (routePath === "/") {
    return path.join(outputRoot, "index.html");
  }

  const relativeRoute = routePath.replace(/^\//, "");
  if (!path.extname(relativeRoute)) {
    return path.join(outputRoot, relativeRoute, "index.html");
  }

  return path.join(outputRoot, relativeRoute);
}

export function isListRouteMatch(page: PageDefinition, routePath: string) {
  const prefix = page.directory.relativePath
    ? `/${toPosix(page.directory.relativePath)}/`
    : "/";
  return routePath.startsWith(prefix) && routePath.endsWith(".html");
}

export function isPublicDataRoute(routePath: string) {
  return routePath === "/data.json" || routePath.endsWith("/data.json");
}

export function normalizeDirectoryPathFromRoute(routePath: string) {
  if (routePath === "/data.json") {
    return "/";
  }

  return routePath.replace(/\/data\.json$/, "").replace(/\.html$/, "");
}

export function normalizeListItems(
  rawItems: unknown,
  slug: string | undefined,
  sourceDescription: string,
): ListPageItem[] {
  return parseListPageItems(rawItems, sourceDescription).filter(
    (item) => !slug || item.name === slug,
  );
}

export function normalizeRequestedRoute(
  routePath: string,
  fragmentName: string,
) {
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
    routePath: normalizeServeRoutePath(routePath === "" ? "/" : routePath),
  };
}

export function normalizeServeRoutePath(routePath: string) {
  if (
    routePath === "/" ||
    routePath.endsWith("/") ||
    path.extname(routePath) ||
    routePath.endsWith("/data.json") ||
    routePath === "/data.json"
  ) {
    return routePath;
  }

  return `${routePath}.html`;
}
