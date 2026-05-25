import path from "node:path";
import process from "node:process";

import { OrisonGenerator } from "./orison-generator";
import { OrisonServer } from "./orison-server";
import { OrisonStaticServer } from "./orison-static-server";

const [, , command, rootArgument] = process.argv;
const rootPath = rootArgument
  ? path.resolve(process.cwd(), rootArgument)
  : process.cwd();

async function main() {
  switch (command) {
    case "build":
      await new OrisonGenerator({ rootPath }).build();
      return;
    case "serve":
      await new OrisonServer({ rootPath }).start();
      return;
    case "static":
      await new OrisonStaticServer({ rootPath }).start();
      return;
    default:
      console.error("Usage: orison <build|serve|static> [rootPath]");
      process.exitCode = 1;
  }
}

void main();
