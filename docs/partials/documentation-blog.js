import fs from 'node:fs/promises';
import path from 'node:path';

let cachedPosts;

async function readDocumentationPosts() {
  if (!cachedPosts) {
    cachedPosts = loadDocumentationPosts();
  }

  return cachedPosts;
}

async function loadDocumentationPosts() {
  const documentationDirectory = path.join(import.meta.dirname, 'documentation');
  const files = await fs.readdir(documentationDirectory);
  const markdownFiles = files.filter(fileName => fileName.endsWith('.md')).sort();

  return Promise.all(markdownFiles.map(async fileName => {
    const filePath = path.join(documentationDirectory, fileName);
    const body = await fs.readFile(filePath, 'utf8');
    const title = firstHeading(body) ?? titleCase(path.basename(fileName, '.md'));
    const description = firstParagraph(body) ?? `Documentation article for ${title}.`;
    const slug = path.basename(fileName, '.md');

    return {
      fields: {
        body,
        description,
        heroImage: {
          fields: {
            description: title,
            file: {
              url: '/icons/icon-512x512.png'
            }
          }
        },
        publishDate: new Date('2024-01-01T00:00:00.000Z').toISOString(),
        slug,
        tags: ['Orison-blog'],
        title
      },
      mdFilePath: `./src/partials/documentation/${slug}.md`
    };
  }));
}

function firstHeading(markdown) {
  return markdown
    .split('\n')
    .map(line => line.trim())
    .find(line => line.startsWith('#'))
    ?.replace(/^#+\s*/, '')
    .trim();
}

function firstParagraph(markdown) {
  return markdown
    .split('\n\n')
    .map(block => block.replace(/[#*_`]/g, '').trim())
    .find(block => block.length > 0 && !block.startsWith('```'));
}

function titleCase(value) {
  return value
    .split(/[-_]/g)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function getDocumentationPosts({ limit, order, skip = 0, slug } = {}) {
  let items = await readDocumentationPosts();

  if (slug) {
    items = items.filter(entry => entry.fields.slug === slug);
  }

  if (order === '-fields.publishDate') {
    items = [...items].reverse();
  }

  const end = typeof limit === 'number' ? skip + limit : undefined;
  return items.slice(skip, end);
}

export async function getDocumentationPost(slug) {
  const [entry] = await getDocumentationPosts({ slug });
  return entry ?? null;
}