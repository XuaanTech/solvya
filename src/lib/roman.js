/**
 * Conversión entre números romanos y decimales (1–3999).
 */

const ROMAN_MAP = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

const ROMAN_VAL = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

/** Forma válida estándar (1–3999). */
const ROMAN_RE = /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;

/**
 * Convierte un entero (1–3999) a su representación en números romanos.
 * Devuelve `null` si el número está fuera de rango.
 */
export function toRoman(n) {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return null;
  let num = n;
  let s = '';
  for (const [v, sym] of ROMAN_MAP) {
    while (num >= v) {
      s += sym;
      num -= v;
    }
  }
  return s;
}

/**
 * Parsea un número romano y devuelve su valor decimal, o null si no es válido.
 */
export function fromRoman(str) {
  if (typeof str !== 'string') return null;
  const s = str.trim().toUpperCase();
  if (!s || !ROMAN_RE.test(s)) return null;
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = ROMAN_VAL[s[i]] ?? 0;
    const next = ROMAN_VAL[s[i + 1]] ?? 0;
    total += cur < next ? -cur : cur;
  }
  return total;
}

/**
 * Devuelve el desglose de un número romano como lista de { value, symbol }.
 * Ej: 1987 → [ { value: 1000, symbol: 'M' }, { value: 900, symbol: 'CM' }, ... ]
 */
export function romanBreakdown(n) {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return [];
  const parts = [];
  let num = n;
  for (const [v, sym] of ROMAN_MAP) {
    if (num >= v) {
      for (let i = 0; i < Math.floor(num / v); i++) {
        parts.push({ value: v, symbol: sym });
      }
      num %= v;
    }
  }
  return parts;
}
