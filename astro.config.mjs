// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const ROOT = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = join(ROOT, 'src', 'content');

/** True when a content path is a `.en.mdx` companion (never a standalone route). */
function isEnArticlePath(p) {
  return /\.en\.mdx$/i.test(String(p));
}

function collectMdx(dir, acc = []) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collectMdx(full, acc);
    else if (entry.isFile() && entry.name.endsWith('.mdx')) acc.push(full);
  }
  return acc;
}

function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return {};
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return {};
  const body = raw.slice(3, end).trim();
  const result = {};
  let currentKey = null;
  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const listMatch = trimmed.match(/^-\s+(.*)$/);
    if (listMatch && currentKey && Array.isArray(result[currentKey])) {
      result[currentKey].push(listMatch[1].trim());
      continue;
    }
    const kv = trimmed.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    currentKey = kv[1];
    let value = kv[2].trim();
    if (/^\[.*\]$/.test(value)) {
      result[currentKey] = value.slice(1, -1).split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    } else {
      result[currentKey] = value.replace(/^['"]|['"]$/g, '');
    }
  }
  return result;
}

/** Nombres de categoría bilingües (es/en) para el índice de búsqueda. */
function catName(cats, id) {
  const c = cats.find((x) => x.slug === id);
  return c && c.name
    ? { es: c.name.es || id, en: c.name.en || id }
    : { es: id, en: id };
}

function writeSearchIndex(outDir) {
  const cats = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'categories.json'), 'utf8'));
  const tools = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'tools.json'), 'utf8'));
  const files = collectMdx(CONTENT_DIR).filter((f) => !isEnArticlePath(f));
  const index = [];

  // Herramientas (bilingüe) - both ES and EN URLs
  for (const tool of tools) {
    const cat = catName(cats, tool.category);
    const titleEs = tool.name?.es || tool.name || '';
    const titleEn = tool.name?.en || titleEs;
    const descEs = tool.shortDescription?.es || '';
    const descEn = tool.shortDescription?.en || descEs;
    const keywords = Array.isArray(tool.keywords) ? tool.keywords.join(' ') : (tool.keywords || '');
    const base = `${titleEs} ${titleEn} ${descEs} ${descEn} ${cat.es} ${cat.en} ${keywords}`.toLowerCase();
    index.push({
      titleEs,
      titleEn,
      descEs,
      descEn,
      type: 'herramienta',
      categoryEs: cat.es,
      categoryEn: cat.en,
      categorySlug: tool.category,
      url: `/herramienta/${tool.slug}/`,
      text: base,
    });
    index.push({
      titleEs,
      titleEn,
      descEs,
      descEn,
      type: 'herramienta',
      categoryEs: cat.es,
      categoryEn: cat.en,
      categorySlug: tool.category,
      url: `/en/herramienta/${tool.slug}/`,
      text: base,
    });
  }

  // Artículos MDX (bilingüe) - both ES and EN URLs
  for (const file of files) {
    const raw = readFileSync(file, 'utf8');
    const fm = parseFrontmatter(raw);
    const rel = file.slice(CONTENT_DIR.length + 1).replace(/\.mdx$/, '');
    const [category, slug] = rel.split(/[\\/]/);
    const cat = catName(cats, category);
    const titleEs = fm.title || slug;
    const titleEn = fm.titleEn || titleEs;
    const descEs = fm.description || '';
    const descEn = fm.descriptionEn || descEs;
    const tags = Array.isArray(fm.tags) ? fm.tags.join(' ') : (fm.tags || '');
    const base = `${titleEs} ${titleEn} ${descEs} ${descEn} ${cat.es} ${cat.en} ${tags}`.toLowerCase();
    const esUrl = `/${category}/${slug}/`;
    const enUrl = `/en${esUrl}`;
    index.push({
      titleEs,
      titleEn,
      descEs,
      descEn,
      type: 'articulo',
      categoryEs: cat.es,
      categoryEn: cat.en,
      categorySlug: category,
      date: fm.updated || fm.date || '',
      url: esUrl,
      text: base,
    });
    index.push({
      titleEs,
      titleEn,
      descEs,
      descEn,
      type: 'articulo',
      categoryEs: cat.es,
      categoryEn: cat.en,
      categorySlug: category,
      date: fm.updated || fm.date || '',
      url: enUrl,
      text: base,
    });
  }

  index.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.titleEs.localeCompare(b.titleEs));
  const outFile = join(outDir, 'search-index.json');
  if (!existsSync(dirname(outFile))) mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(index), 'utf8');
  console.log(`[search-index] Wrote ${index.length} entries to ${outFile}`);
}

function searchIndex() {
  return {
    name: 'search-index',
    hooks: {
      'astro:config:setup': ({ config }) => {
        writeSearchIndex(fileURLToPath(config.publicDir));
      },
    },
  };
}

function buildLastmodMap() {
  const files = collectMdx(CONTENT_DIR).filter((f) => !isEnArticlePath(f));
  const map = new Map();
  for (const file of files) {
    const raw = readFileSync(file, 'utf8');
    const fm = parseFrontmatter(raw);
    const rel = file.slice(CONTENT_DIR.length + 1).replace(/\.mdx$/, '');
    const [category, slug] = rel.split(/[\\/]/);
    const lastmod = fm.updated || fm.date || '';
    if (lastmod) {
      const esPath = `/${category}/${slug}/`;
      map.set(esPath, lastmod);
      map.set(`/en${esPath}`, lastmod);
    }
  }
  return map;
}

const lastmodMap = buildLastmodMap();

export default defineConfig({
  site: 'https://solvya.pages.dev',
  trailingSlash: 'always',
  prefetch: true,
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/404') && !page.includes('/search'),
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es',
          en: 'en',
        },
      },
      serialize(item) {
        const pathname = new URL(item.url).pathname;
        const lastmod = lastmodMap.get(pathname);
        if (lastmod) item.lastmod = new Date(lastmod);
        return item;
      },
    }),
    searchIndex(),
  ],
  markdown: {
    shikiConfig: { theme: 'github-light' },
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});