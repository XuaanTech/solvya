import { I18N } from '../data/site';

/** Helpers server-side para resolver texto localizado en el diccionario. */

export const DEFAULT_LANG = 'es';
export const LANGS = ['es', 'en'];

/** Check if value is a valid language */
export function isLang(value) {
  return LANGS.includes(value);
}

/**
 * Navega el diccionario por clave punteada: "nav.home" → "Inicio".
 * Acepta un diccionario opcional (compatibilidad); por defecto usa I18N central.
 */
export function langNode(lang, key, dict = I18N) {
  const parts = key.split('.');
  let node = dict[lang];
  for (const p of parts) {
    if (node && typeof node === 'object' && p in node) {
      node = node[p];
    } else {
      node = undefined;
      break;
    }
  }
  return node;
}

/** Resuelve texto en el idioma pedido, con fallback a español y luego a la clave. */
export function langText(lang, key, dict = I18N) {
  return langNode(lang, key, dict) ?? langNode(DEFAULT_LANG, key, dict) ?? key;
}

/** Texto del idioma "otro" (para etiquetas del selector). */
export function otherLang(lang) {
  return LANGS.find((l) => l !== lang) ?? DEFAULT_LANG;
}

/** Pick bilingual field {es, en}[lang] with ES fallback */
export function pick(field, lang) {
  if (field && typeof field === 'object' && 'es' in field && 'en' in field) {
    return field[lang];
  }
  return field;
}