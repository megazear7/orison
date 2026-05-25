import { builtinModules } from "node:module";

import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

import packageJson from "./package.json" with { type: "json" };

const dependencies = new Set([
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
]);

const isExternal = (id) => {
  if (id.startsWith("node:")) {
    return true;
  }

  const packageName = id.startsWith("@")
    ? id.split("/").slice(0, 2).join("/")
    : id.split("/")[0];
  return (
    builtinModules.includes(id) ||
    builtinModules.includes(packageName) ||
    dependencies.has(packageName)
  );
};

export default {
  input: {
    cli: "./src/cli.ts",
    orison: "./src/index.ts",
  },
  output: {
    banner: (chunk) =>
      chunk.fileName === "cli.js" ? "#!/usr/bin/env node" : "",
    dir: "./bin",
    entryFileNames: "[name].js",
    exports: "named",
    format: "cjs",
    sourcemap: true,
  },
  external: isExternal,
  plugins: [
    resolve({ preferBuiltins: true }),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
  ],
};
