/**
 * Grupos de unidades para el conversor.
 * Cada grupo tiene una unidad base (factor = 1) y las demás expresadas
 * como factor × base. La temperatura es un caso especial con offsets.
 */
export const UNIT_GROUPS = [
  {
    id: 'longitud',
    name: 'Longitud',
    icon: '📏',
    units: [
      { id: 'm',   name: 'Metros',    symbol: 'm',   factor: 1 },
      { id: 'km',  name: 'Kilómetros', symbol: 'km',  factor: 1000 },
      { id: 'cm',  name: 'Centímetros', symbol: 'cm', factor: 0.01 },
      { id: 'mm',  name: 'Milímetros', symbol: 'mm',  factor: 0.001 },
      { id: 'mi',  name: 'Millas',     symbol: 'mi',  factor: 1609.344 },
      { id: 'yd',  name: 'Yardas',     symbol: 'yd',  factor: 0.9144 },
      { id: 'ft',  name: 'Pies',       symbol: 'ft',  factor: 0.3048 },
      { id: 'in',  name: 'Pulgadas',   symbol: 'in',  factor: 0.0254 },
    ],
  },
  {
    id: 'masa',
    name: 'Masa',
    icon: '⚖️',
    units: [
      { id: 'kg',  name: 'Kilogramos',  symbol: 'kg',  factor: 1 },
      { id: 'g',   name: 'Gramos',      symbol: 'g',   factor: 0.001 },
      { id: 'mg',  name: 'Miligramos',  symbol: 'mg',  factor: 0.000001 },
      { id: 't',   name: 'Toneladas',   symbol: 't',   factor: 1000 },
      { id: 'lb',  name: 'Libras',      symbol: 'lb',  factor: 0.453592 },
      { id: 'oz',  name: 'Onzas',       symbol: 'oz',  factor: 0.0283495 },
    ],
  },
  {
    id: 'temperatura',
    name: 'Temperatura',
    icon: '🌡️',
    special: 'temperature',
    units: [
      { id: 'C', name: 'Celsius',    symbol: '°C' },
      { id: 'F', name: 'Fahrenheit', symbol: '°F' },
      { id: 'K', name: 'Kelvin',     symbol: 'K'  },
    ],
  },
  {
    id: 'volumen',
    name: 'Volumen',
    icon: '🧊',
    units: [
      { id: 'L',   name: 'Litros',       symbol: 'L',   factor: 1 },
      { id: 'mL',  name: 'Mililitros',   symbol: 'mL',  factor: 0.001 },
      { id: 'gal', name: 'Galones (US)',  symbol: 'gal', factor: 3.78541 },
      { id: 'qt',  name: 'Cuartos (US)',  symbol: 'qt',  factor: 0.946353 },
      { id: 'pt',  name: 'Pints (US)',    symbol: 'pt',  factor: 0.473176 },
      { id: 'cup', name: 'Tazas (US)',    symbol: 'cup', factor: 0.236588 },
      { id: 'floz', name: 'Fl oz (US)',   symbol: 'fl oz', factor: 0.0295735 },
      { id: 'm3',  name: 'Metros cúbicos', symbol: 'm³', factor: 1000 },
    ],
  },
];

/**
 * Convert between two temperature units.
 * Special case because temperatures have offsets.
 */
export function convertTemperature(value, fromId, toId) {
  if (fromId === toId) return value;
  // Convert to Celsius first
  let celsius;
  switch (fromId) {
    case 'C': celsius = value; break;
    case 'F': celsius = (value - 32) * 5 / 9; break;
    case 'K': celsius = value - 273.15; break;
    default: return NaN;
  }
  // Convert from Celsius to target
  switch (toId) {
    case 'C': return celsius;
    case 'F': return celsius * 9 / 5 + 32;
    case 'K': return celsius + 273.15;
    default: return NaN;
  }
}

/**
 * Convert between two units within the same group.
 * @param {number} value
 * @param {object} fromUnit
 * @param {object} toUnit
 * @param {boolean} isTemperature
 */
export function convert(value, fromUnit, toUnit, isTemperature = false) {
  if (isTemperature) return convertTemperature(value, fromUnit.id, toUnit.id);
  return value * fromUnit.factor / toUnit.factor;
}

// ── Grupos de conversión lineales para herramientas dedicadas ──
// Todos expresados como factor × base lineal: reutilizan la lógica de convert().

export const SPEED_UNITS = [
  { id: 'ms',   name: 'Metros por segundo',     symbol: 'm/s',   factor: 1 },
  { id: 'kmh',  name: 'Kilómetros por hora',    symbol: 'km/h',  factor: 1 / 3.6 },
  { id: 'mph',  name: 'Millas por hora',        symbol: 'mph',   factor: 0.44704 },
  { id: 'kn',   name: 'Nudos',                  symbol: 'kn',    factor: 0.514444 },
  { id: 'fts',  name: 'Pies por segundo',       symbol: 'ft/s',  factor: 0.3048 },
  { id: 'ma',   name: 'Mach (nivel del mar)',   symbol: 'Ma',    factor: 340.29 },
];

export const STORAGE_UNITS = [
  { id: 'bit', name: 'Bits',                symbol: 'bit', factor: 1 / 8 },
  { id: 'B',   name: 'Bytes',               symbol: 'B',   factor: 1 },
  { id: 'KB',  name: 'Kilobytes (1000)',    symbol: 'KB',  factor: 1e3 },
  { id: 'MB',  name: 'Megabytes (1000)',    symbol: 'MB',  factor: 1e6 },
  { id: 'GB',  name: 'Gigabytes (1000)',    symbol: 'GB',  factor: 1e9 },
  { id: 'TB',  name: 'Terabytes (1000)',    symbol: 'TB',  factor: 1e12 },
  { id: 'PB',  name: 'Petabytes (1000)',    symbol: 'PB',  factor: 1e15 },
  { id: 'KiB', name: 'Kibibytes (1024)',    symbol: 'KiB', factor: 1024 },
  { id: 'MiB', name: 'Mebibytes (1024)',    symbol: 'MiB', factor: 1024 ** 2 },
  { id: 'GiB', name: 'Gibibytes (1024)',    symbol: 'GiB', factor: 1024 ** 3 },
  { id: 'TiB', name: 'Tebibytes (1024)',    symbol: 'TiB', factor: 1024 ** 4 },
];

export const TIME_UNITS = [
  { id: 'ms',     name: 'Milisegundos',      symbol: 'ms',   factor: 0.001 },
  { id: 's',      name: 'Segundos',          symbol: 's',    factor: 1 },
  { id: 'min',    name: 'Minutos',           symbol: 'min',  factor: 60 },
  { id: 'h',      name: 'Horas',             symbol: 'h',    factor: 3600 },
  { id: 'd',      name: 'Días',              symbol: 'd',    factor: 86400 },
  { id: 'semana', name: 'Semanas',           symbol: 'sem',  factor: 604800 },
  { id: 'mes',    name: 'Meses (media 30,44)', symbol: 'mes', factor: 2629800 },
  { id: 'anio',   name: 'Años (365,25 días)', symbol: 'año',  factor: 31557600 },
];

/** Conversión lineal genérica dentro de un mismo grupo. */
export function convertLinear(value, fromUnit, toUnit) {
  return value * fromUnit.factor / toUnit.factor;
}