import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

import createJiti from "jiti";

import { requireFromPackage } from "./options";
import { parseProjectModuleFunction } from "./schemas";
import {
  camelCase,
  exists,
  isMissingModuleError,
  resolveExistingModulePath,
  stableStringify,
  walkFiles,
} from "./utils";
import type {
  DirectoryNode,
  OrisonLoaderDefinition,
  PageContext,
  PageDefinition,
  ResolvedOptions,
} from "./types";

export class ProjectModuleLoader {
  constructor(private readonly options: ResolvedOptions) {}

  async loadCallableModule(filePath: string, sourceDescription: string) {
    const loaded = await this.loadModuleDefault(filePath);
    return parseProjectModuleFunction(loaded, sourceDescription);
  }

  async loadLoaders(
    loaderDefinitions: OrisonLoaderDefinition[],
    loaderCache: Map<string, Promise<unknown>>,
  ): Promise<PageContext["loaders"]> {
    const loadersDirectory = path.join(this.options.sourceRoot, "loaders");
    const fileLoaders = (await exists(loadersDirectory))
      ? await walkFiles(loadersDirectory)
      : [];
    const loaderEntries: OrisonLoaderDefinition[] = [
      ...loaderDefinitions,
      ...(await Promise.all(
        fileLoaders
          .filter((filePath) => /\.(?:[cm]?js|ts)$/.test(filePath))
          .map(async (filePath) => ({
            loader: await this.loadCallableModule(
              filePath,
              `loader module ${filePath}`,
            ),
            name: camelCase(path.basename(filePath, path.extname(filePath))),
          })),
      )),
    ];

    return Object.fromEntries(
      loaderEntries.map((entry) => [
        entry.name,
        async (...args: readonly unknown[]) => {
          const cacheKey = `${entry.name}:${stableStringify(args)}`;
          if (!loaderCache.has(cacheKey)) {
            loaderCache.set(cacheKey, Promise.resolve(entry.loader(...args)));
          }

          const cachedValue = loaderCache.get(cacheKey);
          if (!cachedValue) {
            throw new Error(`Missing loader cache entry for ${cacheKey}`);
          }

          return cachedValue;
        },
      ]),
    ) as PageContext["loaders"];
  }

  resolveProjectFilePath(page: PageDefinition, candidatePath: string) {
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

  async resolveLayoutPath(
    directory: DirectoryNode,
    layoutFileBasename: string,
  ): Promise<string | null> {
    let current: DirectoryNode | null = directory;
    while (current) {
      for (const extension of [".js", ".ts"]) {
        const candidate = path.join(
          current.sourcePath,
          `${layoutFileBasename}${extension}`,
        );
        if (await exists(candidate)) {
          return candidate;
        }
      }
      current = current.parent;
    }

    return null;
  }

  private createJiti() {
    return createJiti(__filename, {
      fsCache: false,
      interopDefault: true,
      moduleCache: process.env.NODE_ENV === "production",
    });
  }

  private async loadModuleDefault(filePath: string): Promise<unknown> {
    const jiti = this.createJiti();
    let loaded: unknown;
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

    if (loaded && typeof loaded === "object" && "default" in loaded) {
      return (loaded as { default: unknown }).default;
    }

    return loaded;
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
}
