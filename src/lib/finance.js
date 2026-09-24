/**
 * Lógica pura de cálculos financieros.
 * Sin DOM, sin I/O, testeable directamente con Node.
 */

/**
 * Interés compuesto con composición mensual y aportaciones mensuales.
 * @param {number} capitalInicial - capital de partida (€)
 * @param {number} aportacionMensual - aportación fija cada mes (€)
 * @param {number} interesAnual - tipo de interés nominal anual en % (ej. 5 → 5%)
 * @param {number} anios - horizonte en años (admite decimales)
 */
export function interesCompuesto({ capitalInicial, aportacionMensual, interesAnual, anios }) {
  const vals = [capitalInicial, aportacionMensual, interesAnual, anios];
  if (vals.some((v) => !Number.isFinite(v))) return null;
  if (capitalInicial < 0 || aportacionMensual < 0 || interesAnual < 0 || anios <= 0) return null;
  if (capitalInicial === 0 && aportacionMensual === 0) return null;

  const r = interesAnual / 100 / 12;
  const n = Math.round(anios * 12);
  const growth = Math.pow(1 + r, n);

  let final = capitalInicial * growth;
  final += r > 0
    ? aportacionMensual * ((growth - 1) / r)
    : aportacionMensual * n;

  const totalAportado = capitalInicial + aportacionMensual * n;
  return {
    final: final,
    totalAportado: totalAportado,
    interes: final - totalAportado,
  };
}

/** IVA a partir de la base imponible (precio sin IVA). */
export function ivaDesdeBase(base, tasa) {
  if (!Number.isFinite(base) || base <= 0 || !Number.isFinite(tasa) || tasa < 0) return null;
  const iva = base * (tasa / 100);
  return { base, iva, total: base + iva };
}

/** IVA a partir del precio total (con IVA incluido): extrae la base. */
export function ivaDesdeTotal(total, tasa) {
  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(tasa) || tasa < 0) return null;
  const base = total / (1 + tasa / 100);
  return { base, iva: total - base, total };
}