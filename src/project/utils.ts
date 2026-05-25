import fs from "node:fs/promises";
import path from "node:path";

import type {
  DirectoryNode,
  JsonRecord,
  PageDefinition,
  RenderedOutput,
} from "./types";

export function camelCase(value: string) {
  return value.replace(/[-_](.)/g, (_, character: string) =>
    character.toUpperCase(),
  );
}

export function compareDirectories(left: DirectoryNode, right: DirectoryNode) {
  const leftOrder = Number(left.data.orison?.order ?? Number.MAX_SAFE_INTEGER);
  const rightOrder = Number(
    right.data.orison?.order ?? Number.MAX_SAFE_INTEGER,
  );
  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }
  return left.name.localeCompare(right.name);
}

export function countDirectories(directory: DirectoryNode): number {
  return (
    1 +
    directory.children.reduce(
      (total, child) => total + countDirectories(child),
      0,
    )
  );
}

export function dedupeOutputs(outputs: RenderedOutput[]) {
  const seen = new Map<string, RenderedOutput>();
  for (const output of outputs) {
    seen.set(output.outputPath, output);
  }
  return [...seen.values()];
}

export function deepMerge(base: JsonRecord, override: JsonRecord): JsonRecord {
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

export async function exists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

export function formatByteSize(value: number) {
  return new Intl.NumberFormat("en-US").format(value) + " bytes";
}

export function getParents(directory: DirectoryNode) {
  const parents: DirectoryNode[] = [];
  let current = directory.parent;
  while (current) {
    parents.unshift(current);
    current = current.parent;
  }
  return parents;
}

export function getSlugFromListRoute(page: PageDefinition, routePath: string) {
  const normalized = routePath.replace(/\.html$/, "").replace(/\/$/, "");
  const segments = normalized.split("/").filter(Boolean);
  const pageSegments = page.directory.relativePath
    .split(path.sep)
    .filter(Boolean);
  return segments.slice(pageSegments.length).join("/");
}

export function isMissingModuleError(
  error: unknown,
): error is { code: string } {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return (error as { code: string }).code === "MODULE_NOT_FOUND";
}

export function isPlainObject(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function resolveExistingModulePath(resolvedPath: string) {
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

export function stableStringify(value: unknown) {
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

export function toPosix(targetPath: string) {
  return targetPath.split(path.sep).join("/");
}

export async function walkFiles(rootPath: string): Promise<string[]> {
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
