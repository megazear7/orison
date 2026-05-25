import fs from "node:fs/promises";

import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { renderThunked } from "@lit-labs/ssr";

import { html as orisonHtml } from "../html";
import type { PageContext } from "./types";

const AsyncFunction = Object.getPrototypeOf(async function () {
  return undefined;
}).constructor as new (
  ...args: string[]
) => (...runtimeArgs: any[]) => Promise<any>;

export async function evaluateHtmlTemplate(
  sourcePath: string,
  context: PageContext,
) {
  const source = await fs.readFile(sourcePath, "utf8");
  const escaped = source.replaceAll("\\", "\\\\").replaceAll("`", "\\`");
  const templateFactory = new AsyncFunction(
    "context",
    "html",
    `return html\`${escaped}\`;`,
  );
  return templateFactory(context, orisonHtml);
}

export async function renderUnknown(value: unknown): Promise<string> {
  if (value === null || value === undefined || value === false) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const chunks = await Promise.all(value.map(renderUnknown));
    return chunks.join("");
  }

  return collectResult(renderThunked(value));
}
