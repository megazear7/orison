export type JsonRecord = Record<string, any>;

export type OrisonLoaderDefinition = {
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

export type ResolvedOptions = Required<
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

export type DirectoryNode = {
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

export type PageDefinition = {
  directory: DirectoryNode;
  kind: "file" | "list";
  name: string;
  relativePath: string;
  routeBase: string;
  sourcePath: string;
  sourcePathFromPagesRoot: string;
};

export type RenderedOutput = {
  body: string;
  contentType: "application/json" | "text/html";
  outputPath: string;
  routePath: string;
};

export type RenderedRoute = {
  content: string;
  contentType: "application/json" | "text/html";
  statusCode: number;
};

export type BuildResult = {
  files: string[];
  pages: string[];
};

export type PageRuntime = {
  html: string;
  routePath: string;
};

export type PageContext = {
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
