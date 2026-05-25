import fs from "node:fs/promises";
import path from "node:path";

import { normalizeDirectoryPathFromRoute } from "./routes";
import { compareDirectories, deepMerge, exists, toPosix } from "./utils";
import type {
  DirectoryNode,
  JsonRecord,
  PageDefinition,
  RenderedOutput,
  ResolvedOptions,
} from "./types";

export function createPublicOutputs(
  options: ResolvedOptions,
  directory: DirectoryNode,
): RenderedOutput[] {
  const outputs: RenderedOutput[] = [];
  if (directory.localData.public) {
    outputs.push({
      body: JSON.stringify(directory.localData.public, null, 2),
      contentType: "application/json",
      outputPath: path.join(
        options.outputRoot,
        directory.relativePath,
        "data.json",
      ),
      routePath:
        directory.path === "/" ? "/data.json" : `${directory.path}/data.json`,
    });
  }

  for (const child of directory.children) {
    outputs.push(...createPublicOutputs(options, child));
  }

  return outputs;
}

export async function collectPages(
  options: ResolvedOptions,
  directory: DirectoryNode,
): Promise<PageDefinition[]> {
  const entries = await fs.readdir(directory.sourcePath, {
    withFileTypes: true,
  });
  const localPages = entries
    .filter((entry) => entry.isFile())
    .filter((entry) => /\.(?:html|js|ts)$/.test(entry.name))
    .filter((entry) => entry.name !== `${options.layoutFileBasename}.js`)
    .filter((entry) => entry.name !== `${options.layoutFileBasename}.ts`)
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
    directory.children.map((child) => collectPages(options, child)),
  );
  return [...localPages, ...childPages.flat()];
}

export function getPublicOutputForRoute(
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
    const childResult = getPublicOutputForRoute(child, routePath);
    if (childResult) {
      return childResult;
    }
  }

  return null;
}

export async function inspectSite(options: ResolvedOptions) {
  const tree = await readDirectoryTree(options, "", null);
  const pages = await collectPages(options, tree);
  return { pages, tree };
}

export async function readDirectoryTree(
  options: ResolvedOptions,
  relativePath: string,
  parent: DirectoryNode | null,
): Promise<DirectoryNode> {
  const sourcePath = path.join(options.pagesRoot, relativePath);
  const localDataPath = path.join(
    sourcePath,
    `${options.dataFileBasename}.json`,
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
        readDirectoryTree(
          options,
          path.join(relativePath, entry.name),
          directory,
        ),
      ),
  );

  directory.children = childDirectories.sort(compareDirectories);
  return directory;
}
