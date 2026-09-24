/**
 * Módulo del cliente para el selector de idioma ES/EN.
 * El sitio se renderiza en español (SEO); este script intercambia en runtime
 * los textos del diccionario (data-i18n) y las regiones (data-lang-region),
 * y guarda la preferencia en localStorage.
 */
import { I18N } from './data/site.js';

export const DEFAULT_LANG = 'es';
export const LANGS = ['es', 'en'];
export const STORAGE_KEY = 'solvya-lang';

function lookup(lang, key) {
  const parts = key.split('.');
  let node = I18N[lang];
  for (const p of parts) {
    if (node && Object.prototype.hasOwnProperty.call(node, p)) node = node[p];
    else return undefined;
  }
  return typeof node === 'string' ? node : undefined;
}

export function textOf(lang, key) {
  return lookup(lang, key) ?? lookup(DEFAULT_LANG, key) ?? undefined;
}

/** Idioma efectivo actual (leyendo el atributo que stampa el script temprano). */
export function currentLang() {
  try {
    return document.documentElement.getAttribute('data-lang') === 'en' ? 'en' : 'es';
  } catch {
    return DEFAULT_LANG;
  }
}

export function detectLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && LANGS.includes(stored)) return stored;
  } catch { /* almacenamiento no disponible */ }
  try {
    const nav = (navigator.language || 'es').slice(0, 2).toLowerCase();
    if (LANGS.includes(nav)) return nav;
  } catch { /* sin navigator */ }
  return DEFAULT_LANG;
}

export function applyLang(lang) {
  document.documentElement.lang = lang;
  document.documentElement.setAttribute('data-lang', lang);

  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    const on = btn.getAttribute('data-lang-toggle') === lang;
    btn.classList.toggle('lang-toggle__btn--active', on);
    btn.setAttribute('aria-pressed', String(on));
  });

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const t = textOf(lang, key);
    if (t !== undefined) el.textContent = t;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    const t = textOf(lang, key);
    if (t !== undefined) el.setAttribute('placeholder', t);
  });

  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    const t = textOf(lang, key);
    if (t !== undefined) el.setAttribute('aria-label', t);
  });

  document.querySelectorAll('[data-lang-region="es"]').forEach((el) => { el.hidden = lang !== 'es'; });
  document.querySelectorAll('[data-lang-region="en"]').forEach((el) => { el.hidden = lang !== 'en'; });
}

export function initLang() {
  applyLang(detectLang());
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.getAttribute('data-lang-toggle');
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* sin storage */ }
      applyLang(next);
    });
  });
}