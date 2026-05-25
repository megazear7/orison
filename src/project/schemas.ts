import { z } from "zod";

import type {
  JsonRecord,
  JsonValue,
  ListPageItem,
  ProjectModuleFunction,
} from "./types";

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

const jsonRecordSchema: z.ZodType<JsonRecord> = z.record(
  z.string(),
  jsonValueSchema,
);

const listPageItemSchema: z.ZodType<ListPageItem> = z
  .object({
    html: z.unknown(),
    name: z.string().min(1),
  })
  .catchall(z.unknown());

const projectModuleFunctionSchema = z.custom<ProjectModuleFunction>(
  (value) => typeof value === "function",
  "Expected a function export",
);

function formatIssuePath(pathSegments: readonly PropertyKey[]) {
  if (pathSegments.length === 0) {
    return "root";
  }

  return pathSegments.map(String).join(".");
}

function formatZodError(error: z.ZodError) {
  return error.issues
    .map((issue) => `${formatIssuePath(issue.path)}: ${issue.message}`)
    .join("; ");
}

export function parseJsonRecord(value: unknown, sourceDescription: string) {
  const parsed = jsonRecordSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(
      `Invalid JSON object in ${sourceDescription}: ${formatZodError(parsed.error)}`,
    );
  }

  return parsed.data;
}

export function parseOptionalJsonRecord(
  value: unknown,
  sourceDescription: string,
) {
  if (value === undefined) {
    return undefined;
  }

  return parseJsonRecord(value, sourceDescription);
}

export function parseListPageItems(value: unknown, sourceDescription: string) {
  if (value === null || value === undefined || value === false) {
    return [] as ListPageItem[];
  }

  const parsed = z
    .array(listPageItemSchema)
    .safeParse(Array.isArray(value) ? value : [value]);
  if (!parsed.success) {
    throw new Error(
      `Invalid list page items from ${sourceDescription}: ${formatZodError(parsed.error)}`,
    );
  }

  return parsed.data;
}

export function parseProjectModuleFunction(
  value: unknown,
  sourceDescription: string,
) {
  const parsed = projectModuleFunctionSchema.safeParse(value);
  if (!parsed.success) {
    throw new Error(
      `Invalid module export for ${sourceDescription}: ${formatZodError(parsed.error)}`,
    );
  }

  return parsed.data;
}
