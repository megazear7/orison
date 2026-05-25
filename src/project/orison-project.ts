import fs from "node:fs/promises";
import path from "node:path";

import MarkdownIt from "markdown-it";

import { resolveOptions } from "./options";
import { getDirectRoutes } from "./routes";
import { inspectSite } from "./site";
import {
  countDirectories,
  dedupeOutputs,
  exists,
  formatByteSize,
  toPosix,
  walkFiles,
} from "./utils";
import { ProjectModuleLoader } from "./module-loader";
import { ProjectRenderer } from "./project-renderer";
import type {
  BuildResult,
  DirectoryNode,
  OrisonOptions,
  PageDefinition,
  RenderedOutput,
  RenderedRoute,
  ResolvedOptions,
} from "./types";

export class OrisonProject {
  private readonly markdown = new MarkdownIt();

  private readonly moduleLoader: ProjectModuleLoader;

  private readonly options: ResolvedOptions;

  private readonly renderer: ProjectRenderer;

  constructor(options: OrisonOptions = {}) {
    this.options = resolveOptions(options);
    this.moduleLoader = new ProjectModuleLoader(this.options);
    this.renderer = new ProjectRenderer(
      this.options,
      this.markdown,
      this.moduleLoader,
    );
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
    return this.renderer.renderRequest(site, routePath);
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

  private async renderBuildOutputs(root: DirectoryNode) {
    return dedupeOutputs(await this.renderer.renderBuildOutputs(root));
  }

  private async writeOutput(output: RenderedOutput) {
    await fs.mkdir(path.dirname(output.outputPath), { recursive: true });
    await fs.writeFile(output.outputPath, output.body, "utf8");
  }
}
