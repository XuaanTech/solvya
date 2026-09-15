/**
 * Conversión de números a letras (ES/EN) para la herramienta de números en letras.
 * Soporta cardinales hasta 999.999.999.999,99 y dos decimales.
 */

const ES = {
  units: ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'],
  teens: ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'],
  tens: ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'],
  tens21: ['', '', 'veinti', 'treinta y', 'cuarenta y', 'cincuenta y', 'sesenta y', 'setenta y', 'ochenta y', 'noventa y'],
  hundreds: ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'],
};

const EN = {
  units: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
  teens: ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'],
  tens: ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'],
};

/** 1–99 en español. */
function esTens(n) {
  if (n === 0) return '';
  if (n < 10) return ES.units[n];
  if (n < 20) return ES.teens[n - 10];
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (t === 2) return u === 0 ? 'veinte' : ES.tens21[2] + ES.units[u];
  if (u === 0) return ES.tens[t];
  return ES.tens[t] + ' y ' + ES.units[u];
}

/** 1–999 en español. */
function esGroup(n) {
  if (n === 0) return '';
  const h = Math.floor(n / 100);
  const r = n % 100;
  let out = '';
  if (h > 0) out = h === 1 ? (r === 0 ? 'cien' : 'ciento') : ES.hundreds[h];
  const rest = esTens(r);
  return rest ? (out ? out + ' ' + rest : rest) : out;
}

/** Entero ≥ 0 en español. */
function esNumber(n) {
  if (n === 0) return 'cero';
  const mill = Math.floor(n / 1e6);
  const thou = Math.floor((n % 1e6) / 1000);
  const rest = n % 1000;
  const parts = [];
  if (mill > 0) parts.push(mill === 1 ? 'un millón' : esGroup(mill) + ' millones');
  if (thou > 0) parts.push(esGroup(thou) + ' mil');
  if (rest > 0) parts.push(esGroup(rest));
  return parts.join(' ');
}

/** 1–99 en inglés. */
function enTens(n) {
  if (n < 10) return EN.units[n];
  if (n < 20) return EN.teens[n - 10];
  const t = Math.floor(n / 10);
  const u = n % 10;
  return EN.tens[t] + (u ? '-' + EN.units[u] : '');
}

/** 1–999 en inglés. */
function enGroup(n) {
  const h = Math.floor(n / 100);
  const r = n % 100;
  let out = '';
  if (h > 0) out = EN.units[h] + ' hundred';
  const rest = r ? enTens(r) : '';
  return out ? (rest ? out + ' and ' + rest : out) : rest;
}

/** Entero ≥ 0 en inglés. */
function enNumber(n) {
  if (n === 0) return 'zero';
  const scales = [
    ['trillion', 1e12],
    ['billion', 1e9],
    ['million', 1e6],
    ['thousand', 1e3],
  ];
  const parts = [];
  let rem = n;
  for (const [name, v] of scales) {
    const q = Math.floor(rem / v);
    if (q > 0) {
      parts.push(enGroup(q) + ' ' + name);
      rem %= v;
    }
  }
  if (rem > 0) parts.push(enGroup(rem));
  return parts.join(', ');
}

/**
 * Convierte un número a letras. Devuelve null si no es representable.
 * @param {number|string} input
 * @param {'es'|'en'} lang
 */
export function numberToWords(input, lang = 'es') {
  const num = typeof input === 'number' ? input : Number(String(input).replace(/\s/g, '').replace(/,/g, '.'));
  if (!Number.isFinite(num)) return null;
  if (Math.abs(num) > 999999999999.99) return null;

  const neg = num < 0;
  const abs = Math.round(Math.abs(num) * 100) / 100;
  const int = Math.floor(abs);
  const cents = Math.round((abs - int) * 100);

  const intWords = lang === 'en' ? enNumber(int) : esNumber(int);
  let out = neg ? (lang === 'es' ? 'menos ' : 'minus ') + intWords : intWords;

  if (cents > 0) {
    const dec = String(cents).padStart(2, '0');
    if (lang === 'es') {
      out += ' con ' + de2words(cents, 'es') + (cents === 1 ? ' céntimo' : ' céntimos');
    } else {
      out += ' and ' + dec + '/100';
    }
  }
  return out;
}

/** Convierte 1–99 a palabras (para los decimales en español). */
function de2words(n, lang) {
  if (lang === 'en') return enTens(n);
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (n < 10) return ES.units[n];
  if (n < 20) return ES.teens[n - 10];
  if (t === 2) return u === 0 ? 'veinte' : ES.tens21[2] + ES.units[u];
  if (u === 0) return ES.tens[t];
  return ES.tens[t] + ' y ' + ES.units[u];
}