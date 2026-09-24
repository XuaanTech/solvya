/**
 * Utilidades de cálculo de fechas para la herramienta de diferencia de fechas.
 */

/**
 * Parsea una cadena 'YYYY-MM-DD' a un objeto Date en UTC medianoche.
 * Devuelve null si la fecha es inválida.
 */
export function parseISODate(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || ''));
  if (!m) return null;
  const [, y, mo, d] = m.map(Number);
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (isNaN(date.getTime())) return null;
  // Rechaza fechas como 2026-02-31
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return date;
}

/**
 * Días de calendario entre dos fechas (en valor absoluto).
 */
export function daysBetween(a, b) {
  return Math.round(Math.abs(b - a) / 86400000);
}

/**
 * Días laborables (lun–vie) entre dos fechas (ambos inclusive).
 */
export function workdaysBetween(a, b) {
  const start = a < b ? a : b;
  const end = a < b ? b : a;
  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dow = cur.getUTCDay();
    if (dow !== 0 && dow !== 6) count++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

/**
 * Descomposición de calendario entre a y b (b >= a).
 * Devuelve { years, months, weeks, days, totalDays, workdays }.
 */
export function dateBreakdown(a, b) {
  const totalDays = daysBetween(a, b);
  const weeks = Math.floor(totalDays / 7);

  let years = b.getUTCFullYear() - a.getUTCFullYear();
  let months = b.getUTCMonth() - a.getUTCMonth();
  let days = b.getUTCDate() - a.getUTCDate();

  if (days < 0) {
    months--;
    const prevMonthDays = new Date(Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), 0)).getUTCDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, weeks, days, totalDays, workdays: workdaysBetween(a, b) };
}
