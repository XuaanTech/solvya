import { SITE } from '../data/site.js';
import { pick } from './utils.js';

/** Builders de JSON-LD. Centralizan las URLs para que siempre apunten a SITE.url. */

function absUrl(path) {
  const p = path.startsWith('/') ? path.slice(1) : path;
  return `${SITE.url}/${p}`;
}

export function organizationSchema(lang = 'es') {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    "name": SITE.name,
    "url": SITE.url,
    "description": SITE.description,
    "logo": {
      "@type": "ImageObject",
      "url": `${SITE.url}/og-default.png`,
      "width": 1200,
      "height": 630,
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": SITE.email,
      "areaServed": "Worldwide",
      "availableLanguage": lang === 'en' ? 'English' : 'Spanish',
    },
  };
}

export function websiteSchema(lang = 'es') {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE.name,
    "url": SITE.url,
    "description": SITE.description,
    "inLanguage": lang,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE.url}/${lang === 'en' ? 'en/' : ''}search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function articleSchema({ title, description, url, date, updated, author, categoryName, lang = 'es' }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": url,
    "datePublished": date,
    "dateModified": updated || date,
    "author": {
      "@type": "Person",
      "@id": `${SITE.url}/#author`,
      "name": author || SITE.author,
      "url": `${SITE.url}/${lang === 'en' ? 'en/' : ''}about/`,
    },
    "publisher": { "@type": "Organization", "@id": `${SITE.url}/#organization`, "name": SITE.name, "url": SITE.url },
    "mainEntityOfPage": { "@type": "WebPage", "@id": url },
    "articleSection": categoryName,
    "inLanguage": lang,
  };
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.href ? { "item": absUrl(item.href) } : {}),
    })),
  };
}

export function faqSchema(faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
    })),
  };
}

export function collectionSchema({ name, description, url, items, lang = 'es' }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": url,
    "inLanguage": lang,
    "hasPart": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name || item.title,
      "url": item.url,
    })),
  };
}

export function howToSchema({ name, description, url, steps }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    "url": url,
    "step": steps.map((step, i) => ({
      "@type": "HowToStep",
      "position": i + 1,
      "name": step.title,
      "text": step.text,
    })),
    "totalTime": "PT5M",
  };
}

export function softwareAppSchema(tool, lang = 'es') {
  const url = `${SITE.url}/${lang === 'en' ? 'en/' : ''}herramienta/${tool.slug}/`;
  const name = pick(tool.name, lang);
  const short = pick(tool.shortDescription, lang);
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": name,
    "url": url,
    "description": short,
    "inLanguage": lang === 'en' ? 'en' : 'es',
    "applicationCategory": tool.applicationCategory,
    "operatingSystem": "Web",
    "isAccessibleForFree": true,
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
    "featureList": [
      short,
      lang === 'en' ? 'Free to use' : 'Uso gratuito',
      lang === 'en' ? 'Works directly in the browser' : 'Funciona directamente en el navegador',
      lang === 'en' ? 'No sign-up required' : 'Sin registro',
    ],
    "publisher": { "@id": `${SITE.url}/#organization` },
  };
}