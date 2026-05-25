import path from "node:path";

import type { OrisonOptions, ResolvedOptions } from "./types";

export function requireFromPackage(specifier: string) {
  return require(specifier);
}

export function resolveOptions(options: OrisonOptions): ResolvedOptions {
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
