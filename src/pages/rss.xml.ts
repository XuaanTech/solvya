import type { APIRoute } from 'astro';
import { SITE } from '../data/site';
import { categoryFromPath, isEnArticlePath } from '../lib/utils';

export const GET: APIRoute = async () => {
  const modules = import.meta.glob('../content/**/*.mdx', { eager: true }) as Record<string, any>;

  // Group by base slug: iterate the ES `.mdx` files and find their `.en.mdx` companion.
  const esFiles = Object.entries(modules).filter(
    ([path]) => !isEnArticlePath(path) && modules[path]?.frontmatter?.title && modules[path]?.frontmatter?.date
  );

  const items = esFiles
    .map(([path, mod]) => {
      const slug = String(path).split(/[\\/]/).pop()!.replace(/\.mdx$/, '');
      const category = categoryFromPath(path);
      const enPath = String(path).replace(/\.mdx$/, '.en.mdx');
      const enMod = modules[enPath];
      const enTitle = enMod?.frontmatter?.titleEn || (enMod?.frontmatter?.title ?? mod.frontmatter.titleEn ?? mod.frontmatter.title);
      const enDesc = enMod?.frontmatter?.descriptionEn || (enMod?.frontmatter?.description ?? mod.frontmatter.descriptionEn ?? mod.frontmatter.description);
      const items = [];
      // ES item
      items.push({
        title: mod.frontmatter.title,
        description: mod.frontmatter.description ?? '',
        url: `${SITE.url}/${category}/${slug}/`,
        date: mod.frontmatter.date,
        language: 'es',
      });
      // EN item (same date as ES article for ordering)
      if (enMod) {
        items.push({
          title: enTitle,
          description: enDesc ?? '',
          url: `${SITE.url}/en/${category}/${slug}/`,
          date: mod.frontmatter.date,
          language: 'en',
        });
      }
      return items;
    })
    .flat()
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  const itemsXml = items
    .map(
      (item) => `  <item>
    <title><![CDATA[${item.title}]]></title>
    <link>${item.url}</link>
    <guid isPermaLink="true">${item.url}</guid>
    <description><![CDATA[${item.description}]]></description>
    <pubDate>${new Date(item.date).toUTCString()}</pubDate>
  </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE.name}</title>
    <link>${SITE.url}</link>
    <description>${SITE.description}</description>
    <language>es</language>
    <atom:link href="${SITE.url}/rss.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};