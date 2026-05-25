import fs from "node:fs/promises";
import path from "node:path";

type Entry = {
  fields: {
    body: string;
    description: string;
    heroImage: {
      fields: {
        description: string;
        file: {
          url: string;
        };
      };
    };
    publishDate: string;
    slug: string;
    tags: string[];
    title: string;
  };
};

let cachedEntries: Promise<Entry[]> | null = null;

async function readDocumentationEntries() {
  if (!cachedEntries) {
    cachedEntries = loadDocumentationEntries();
  }
  return cachedEntries;
}

async function loadDocumentationEntries(): Promise<Entry[]> {
  const rootPath = process.env.ORISON_PROJECT_ROOT;
  if (!rootPath) {
    return [];
  }

  const documentationDirectory = path.join(
    rootPath,
    "partials",
    "documentation",
  );
  const files = await fs.readdir(documentationDirectory);
  const markdownFiles = files
    .filter((fileName) => fileName.endsWith(".md"))
    .sort();

  return Promise.all(
    markdownFiles.map(async (fileName) => {
      const filePath = path.join(documentationDirectory, fileName);
      const body = await fs.readFile(filePath, "utf8");
      const title =
        firstHeading(body) ?? titleCase(path.basename(fileName, ".md"));
      const description =
        firstParagraph(body) ?? `Documentation article for ${title}.`;

      return {
        fields: {
          body,
          description,
          heroImage: {
            fields: {
              description: title,
              file: {
                url: "/icons/icon-512x512.png",
              },
            },
          },
          publishDate: new Date("2024-01-01T00:00:00.000Z").toISOString(),
          slug: path.basename(fileName, ".md"),
          tags: ["Orison-blog"],
          title,
        },
      };
    }),
  );
}

function firstHeading(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("#"))
    ?.replace(/^#+\s*/, "")
    .trim();
}

function firstParagraph(markdown: string) {
  return markdown
    .split("\n\n")
    .map((block) => block.replace(/[#*_`]/g, "").trim())
    .find((block) => block.length > 0 && !block.startsWith("```"));
}

function titleCase(value: string) {
  return value
    .split(/[-_]/g)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function readFallbackAboutBody() {
  const rootPath = process.env.ORISON_PROJECT_ROOT;
  if (!rootPath) {
    return "Orison documentation";
  }

  const setupPath = path.join(
    rootPath,
    "partials",
    "documentation",
    "setup.md",
  );
  return fs.readFile(setupPath, "utf8");
}

export default {
  async getEntries(searchParams: Record<string, any> = {}) {
    let items = await readDocumentationEntries();

    if (searchParams["fields.tags"]) {
      items = items.filter((entry) =>
        entry.fields.tags.includes(searchParams["fields.tags"]),
      );
    }

    if (searchParams["fields.slug"]) {
      items = items.filter(
        (entry) => entry.fields.slug === searchParams["fields.slug"],
      );
    }

    if (searchParams.order === "-fields.publishDate") {
      items = [...items].reverse();
    }

    const skip = Number(searchParams.skip ?? 0);
    const limit = Number(searchParams.limit ?? items.length);

    return {
      items: items.slice(skip, skip + limit),
    };
  },

  async getEntry() {
    return {
      fields: {
        body: await readFallbackAboutBody(),
      },
    };
  },
};
