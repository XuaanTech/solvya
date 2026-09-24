/**
 * Utilidades de formateo para inputs/outputs de herramientas.
 */

/** Agrupa la parte entera con puntos (1234567 → 1.234.567). */
function groupEs(intPart) {
  return String(intPart).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Normaliza input numérico, tanto español como inglés:
 * - '70,5' → 70.5, '70.5' → 70.5
 * - '1.234,56' (es) → 1234.56, '1,234.56' (en) → 1234.56
 * - espacios y símbolos sobrantes aislados se ignoran
 */
export function parseDecimal(str) {
  if (typeof str === 'number') return str;
  let s = String(str).trim().replace(/\s+/g, '').replace(/[€$£¥%a-zA-Z]/g, '');
  if (!s) return 0;
  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  if (lastDot !== -1 && lastComma !== -1) {
    // Ambos presentes: el último es el separador decimal.
    if (lastComma > lastDot) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (lastComma !== -1 && s.indexOf(',') === s.lastIndexOf(',')) {
    // Solo una coma → decimal (español).
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Formatea número con separadores españoles (1.234,56).
 * Implementación manual: idéntica en todos los navegadores y Node.
 */
export function formatEs(n, decimals = 2) {
  if (!Number.isFinite(n)) return '—';
  const neg = n < 0;
  const abs = Math.abs(n).toFixed(decimals);
  const [int, dec] = abs.split('.');
  const out = groupEs(int) + (decimals > 0 ? ',' + dec : '');
  return (neg ? '-' : '') + out;
}

/**
 * Formatea un número eliminando decimales sobrantes (conversores),
 * siempre con coma decimal y punto de miles.
 */
export function formatSmart(n, decimals = 6) {
  if (!Number.isFinite(n)) return '—';
  const neg = n < 0;
  let abs = Math.abs(n).toFixed(decimals);
  if (abs.includes('.')) abs = abs.replace(/0+$/, '').replace(/\.$/, '');
  const [int, dec] = abs.split('.');
  const out = groupEs(int) + (dec ? ',' + dec : '');
  return (neg ? '-' : '') + out;
}

/** Fecha local de hoy en formato 'YYYY-MM-DD' (para inputs date). */
export function todayLocal() {
  const d = new Date();
  const p = (x) => String(x).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

/** Formatea una fecha Date en formato largo, según el idioma. */
export function formatDateFull(date, lang = 'es') {
  if (!date || isNaN(date.getTime())) return '—';
  const locale = lang === 'en' ? 'en-GB' : 'es-ES';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Formatea como moneda EUR. */
export function formatEur(n) {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });
}

/** True si es un número finito y positivo. */
export function isPositive(n) {
  return Number.isFinite(n) && n > 0;
}

/** Escapa HTML básico para inserción segura en innerHTML. */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
