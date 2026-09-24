import { readFileSync } from 'node:fs';

/** Strip the YAML frontmatter block from a raw MDX source string. */
export function stripFrontmatter(raw) {
  if (!raw.startsWith('---')) return raw;
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return raw;
  return raw.slice(end + 4);
}

/** Estimate reading time from raw article text (~200 words/min), translated label. */
export function readingTimeFromRaw(raw, lang = 'es') {
  const body = stripFrontmatter(raw)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*`~\-_\[\]()!|<>=]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const words = body.length ? body.split(' ').filter(Boolean).length : 1;
  const minutes = Math.max(1, Math.round(words / 200));
  const label = lang === 'en' ? 'min read' : 'min de lectura';
  return minutes === 1 ? `1 ${label}` : `${minutes} ${label}`;
}

/** Reading time from an MDX module's absolute `file` path. */
export function readingTimeFromFile(filePath, lang = 'es') {
  try {
    const raw = readFileSync(filePath, 'utf8');
    return readingTimeFromRaw(raw, lang);
  } catch {
    return lang === 'en' ? '5 min read' : '5 min de lectura';
  }
}

/** Derive the category slug from a module path by looking at its parent dir. */
export function categoryFromPath(path) {
  const segments = String(path).split(/[\\/]/).filter(Boolean);
  if (segments.length < 2) return 'generales';
  return segments[segments.length - 2];
}

/** Format an ISO date in long form, language-aware. */
export function formatDate(iso, lang = 'es') {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Format an ISO date in short form, language-aware. */
export function formatDateShort(iso, lang = 'es') {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : 'es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Pick the localized value from a `{ es, en }` field. */
export function pick(field, lang = 'es') {
  if (!field || typeof field !== 'object') return field ?? '';
  return field[lang] ?? field.es ?? '';
}

/** Returns `/en` for English, empty string for Spanish — use to prefix all internal links. */
export function langBase(lang = 'es') {
  return lang === 'en' ? '/en' : '';
}

// ── bilingual article helpers ──────────────────────────────

/** True when a content path is a `.en.mdx` companion (never a standalone route). */
export function isEnArticlePath(path) {
  return /\.en\.mdx$/i.test(String(path));
}

/** Drop `.en.mdx` entries from an array of [path, mod] pairs. */
export function esOnlyEntries(entries) {
  return entries.filter(([p]) => !isEnArticlePath(p));
}

/** Resolve ES (always) and EN (optional) compiled modules for an article. */
export function findArticleModules(allModules, category, slug) {
  const es = Object.entries(allModules).find(
    ([p]) => categoryFromPath(p) === category && p.endsWith(`${slug}.mdx`) && !isEnArticlePath(p)
  ) ?? null;
  const en = Object.entries(allModules).find(
    ([p]) => categoryFromPath(p) === category && p.endsWith(`${slug}.en.mdx`)
  ) ?? null;
  return { es, en };
}

/** Return { es, en } reading-time labels for an article pair. */
export function articleReadingTimes(esFile, enFile) {
  return {
    es: readingTimeFromFile(esFile, 'es'),
    en: readingTimeFromFile(enFile ?? esFile, 'en'),
  };
}