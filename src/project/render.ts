import fs from "node:fs/promises";

import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { renderThunked } from "@lit-labs/ssr";

import { html as orisonHtml } from "../html";
import type { PageContext } from "./types";

type PromiseLikeValue = {
  then(onfulfilled?: (value: unknown) => unknown): unknown;
};

type TemplateLike = {
  _$litType$: unknown;
  strings: unknown;
  values: unknown[];
};

const AsyncFunction = Object.getPrototypeOf(async function () {
  return undefined;
}).constructor as new (
  ...args: string[]
) => (...runtimeArgs: readonly unknown[]) => Promise<unknown>;

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

function isPromiseLike(value: unknown): value is PromiseLikeValue {
  return !!value && typeof value === "object" && "then" in value;
}

function isTemplateLike(value: unknown): value is TemplateLike {
  return (
    !!value &&
    typeof value === "object" &&
    "_$litType$" in value &&
    "strings" in value &&
    "values" in value &&
    Array.isArray((value as TemplateLike).values)
  );
}

async function resolveRenderValue(value: unknown): Promise<unknown> {
  if (isPromiseLike(value)) {
    return resolveRenderValue(await value);
  }

  if (Array.isArray(value)) {
    return Promise.all(value.map((entry) => resolveRenderValue(entry)));
  }

  if (isTemplateLike(value)) {
    return {
      ...value,
      values: await Promise.all(
        value.values.map((entry) => resolveRenderValue(entry)),
      ),
    };
  }

  return value;
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

  return collectResult(renderThunked(await resolveRenderValue(value)));
}
