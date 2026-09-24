/**
 * Lógica pura de cálculos de salud.
 * Sin DOM, sin I/O, testeable directamente con Node.
 */

// ---- IMC ----
export function imc(pesoKg, alturaCm) {
  if (!Number.isFinite(pesoKg) || !Number.isFinite(alturaCm) || alturaCm <= 0) return NaN;
  const alturaM = alturaCm / 100;
  return pesoKg / (alturaM * alturaM);
}

export function clasificarImc(v) {
  if (!Number.isFinite(v)) return '—';
  if (v < 18.5) return 'Bajo peso';
  if (v < 25) return 'Peso normal';
  if (v < 30) return 'Sobrepeso';
  if (v < 35) return 'Obesidad grado I';
  if (v < 40) return 'Obesidad grado II';
  return 'Obesidad grado III';
}

/** Devuelve una clave i18n de clasificación (underweight, normalWeight, …). */
export function clasificarImcKey(v) {
  if (!Number.isFinite(v)) return '';
  if (v < 18.5) return 'underweight';
  if (v < 25) return 'normalWeight';
  if (v < 30) return 'overweight';
  if (v < 35) return 'obesity1';
  if (v < 40) return 'obesity2';
  return 'obesity3';
}

/** Rango de peso saludable (IMC 18,5–24,9) para una altura en cm. */
export function rangoSaludablePeso(alturaCm) {
  if (!Number.isFinite(alturaCm) || alturaCm <= 0) return { min: NaN, max: NaN };
  const h = alturaCm / 100;
  return { min: 18.5 * h * h, max: 24.9 * h * h };
}

// ---- BMR / TDEE (Mifflin-St Jeor) ----
/**
 * BMR = 10*weight + 6.25*height - 5*age + s
 * s = +5 para hombres, -161 para mujeres
 */
export function bmrMifflinStJeor({ sexo, pesoKg, alturaCm, edad }) {
  if (!Number.isFinite(pesoKg) || !Number.isFinite(alturaCm) || !Number.isFinite(edad) || pesoKg <= 0 || alturaCm <= 0 || edad <= 0) return NaN;
  const s = sexo === 'M' ? 5 : -161;
  return 10 * pesoKg + 6.25 * alturaCm - 5 * edad + s;
}

export const ACTIVITY_FACTORS = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  activo: 1.725,
  muy_activo: 1.9,
};

export function tdee(bmr, actividad) {
  const factor = ACTIVITY_FACTORS[actividad];
  if (!factor) return NaN;
  return bmr * factor;
}

/** Parsea 'YYYY-MM-DD' como fecha local a medianoche (evita saltos de huso horario). */
function parseDateLocal(str) {
  if (typeof str !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(NaN);
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// ---- Ovulación ----
/**
 * Ovulación = inicio_ciclo + duracion - 14
 * Ventana fértil = ovulación - 5 .. ovulación + 1
 * Próximo periodo = ovulación + 14
 */
export function ovulacion({ inicioUltimoPeriodo, duracionCiclo }) {
  const inicio = parseDateLocal(inicioUltimoPeriodo);
  if (isNaN(inicio.getTime())) return null;
  if (!Number.isFinite(duracionCiclo) || duracionCiclo < 21 || duracionCiclo > 45) return null;

  const ovulacionDate = new Date(inicio);
  ovulacionDate.setDate(inicio.getDate() + duracionCiclo - 14);

  const ventanaInicio = new Date(ovulacionDate);
  ventanaInicio.setDate(ovulacionDate.getDate() - 5);

  const ventanaFin = new Date(ovulacionDate);
  ventanaFin.setDate(ovulacionDate.getDate() + 1);

  const proximoPeriodo = new Date(ovulacionDate);
  proximoPeriodo.setDate(ovulacionDate.getDate() + 14);

  return {
    ovulacion: ovulacionDate,
    ventanaFertil: { inicio: ventanaInicio, fin: ventanaFin },
    proximoPeriodo,
  };
}

// ---- Embarazo (Regla de Naegele) ----
/**
 * FPP = FUM + 7 días - 3 meses + 1 año
 * Semana de gestación = (hoy - FUM) / 7
 */
export function embarazoNaegle(fum) {
  const inicio = parseDateLocal(fum);
  if (isNaN(inicio.getTime())) return null;

  // FPP = FUM + 7 días − 3 meses + 1 año
  // Se combinan año+1, mes−3 y día+7 sobre los componentes originales,
  // para que la resta de meses sobre enero/marzo no salte de año.
  const fpp = new Date(inicio.getFullYear() + 1, inicio.getMonth() - 3, inicio.getDate() + 7);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diffMs = hoy - inicio;
  const semanas = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  const dias = Math.floor((diffMs % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));

  return {
    fpp,
    semanaActual: Math.max(0, semanas),
    diaActual: Math.max(0, dias),
  };
}

/** Formatea fecha a "DD de MMMM de YYYY" en español. */
export function formatDateFullEs(date) {
  if (!date || isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// ---- Grasa corporal (método US Navy) ----
/**
 * Estima el porcentaje de grasa corporal con el método de la Marina de EE. UU.
 * Todas las medidas en centímetros. Requiere cadera solo para mujeres.
 * Hombres: 495/(1.0324 − 0.19077·log10(cintura−cuello) + 0.15456·log10(altura)) − 450
 * Mujeres: 495/(1.29579 − 0.35004·log10(cintura+cadera−cuello) + 0.22100·log10(altura)) − 450
 */
export function grasaCorporalNavy({ sexo, alturaCm, cuelloCm, cinturaCm, caderaCm }) {
  const req = [alturaCm, cuelloCm, cinturaCm];
  if (req.some((v) => !Number.isFinite(v) || v <= 0)) return NaN;
  if (sexo === 'F' && (!Number.isFinite(caderaCm) || caderaCm <= 0)) return NaN;
  if (cinturaCm <= cuelloCm) return NaN;
  const log10 = Math.log10;
  let pct;
  if (sexo === 'M') {
    pct = 495 / (1.0324 - 0.19077 * log10(cinturaCm - cuelloCm) + 0.15456 * log10(alturaCm)) - 450;
  } else {
    pct = 495 / (1.29579 - 0.35004 * log10(cinturaCm + caderaCm - cuelloCm) + 0.22100 * log10(alturaCm)) - 450;
  }
  return Number.isFinite(pct) ? Math.max(0, pct) : NaN;
}

/** Clave i18n de clasificación de grasa corporal (rangos ACSM). */
export function clasificarGrasaKey(pct, sexo) {
  if (!Number.isFinite(pct)) return '';
  if (sexo === 'F') {
    if (pct < 14) return 'essential';
    if (pct < 21) return 'athlete';
    if (pct < 25) return 'fitness';
    if (pct < 32) return 'average';
    return 'obese';
  }
  if (pct < 6) return 'essential';
  if (pct < 14) return 'athlete';
  if (pct < 18) return 'fitness';
  if (pct < 25) return 'average';
  return 'obese';
}

// ---- Agua diaria ----
/**
 * Recomendación diaria de agua: ~33 ml por kg de peso,
 * más 350 ml por cada 30 minutos de ejercicio al día.
 */
export function aguaDiaria({ pesoKg, minutosActividad = 0 }) {
  if (!Number.isFinite(pesoKg) || pesoKg <= 0) return NaN;
  const base = pesoKg * 0.033;
  const min = Number.isFinite(minutosActividad) ? minutosActividad : 0;
  const extra = min > 0 ? Math.floor(min / 30) * 0.35 : 0;
  return +(base + extra).toFixed(2);
}

// ---- Zonas de frecuencia cardíaca (Karvonen / FC de reserva) ----
/** Frecuencia cardíaca máxima estimada (fórmula clásica). */
export function fcMaxima(edad) {
  if (!Number.isFinite(edad) || edad <= 0) return NaN;
  return 220 - edad;
}

const ZONAS_FC = [
  { key: 'zone1', min: 0.5, max: 0.6 },
  { key: 'zone2', min: 0.6, max: 0.7 },
  { key: 'zone3', min: 0.7, max: 0.8 },
  { key: 'zone4', min: 0.8, max: 0.9 },
  { key: 'zone5', min: 0.9, max: 1 },
];

/**
 * Devuelve los límites de las 5 zonas (en lpm) por Karvonen:
 * con FC en reposo usa FC de reserva; sin ella, porcentaje de la FC máxima.
 */
export function zonasCardiacas({ edad, reposoFC = 0 }) {
  const max = fcMaxima(edad);
  if (!Number.isFinite(max)) return null;
  const reposo = Number.isFinite(reposoFC) && reposoFC > 0 ? reposoFC : null;
  const base = reposo ? max - reposo : max;
  return ZONAS_FC.map((z) => ({
    key: z.key,
    min: Math.round(base * z.min + (reposo ?? 0)),
    max: z.max >= 1 ? max : Math.round(base * z.max + (reposo ?? 0)),
  }));
}