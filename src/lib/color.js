/**
 * Conversión de colores (puro, sin UI).
 * Formatos aceptados: HEX (#fff / #3498db), RGB (rgb(52,152,219)),
 * HSL (hsl(204,70%,53%)).
 */

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/** Convierte HEX → { r, g, b } o null si inválido. */
export function hexToRgb(hex) {
  let h = String(hex).replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Convierte { r, g, b } → '#rrggbb'. */
export function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}

/** Convierte { r, g, b } → { h, s, l } (0–360, 0–100, 0–100). */
export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

/** Convierte { h, s, l } → { r, g, b }. */
export function hslToRgb(h, s, l) {
  h = ((Number(h) % 360) + 360) % 360 / 360;
  s = clamp(Number(s), 0, 100) / 100;
  l = clamp(Number(l), 0, 100) / 100;
  if (s === 0) { const v = Math.round(l * 255); return { r: v, g: v, b: v }; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return {
    r: Math.round(hue2rgb(h + 1 / 3) * 255),
    g: Math.round(hue2rgb(h) * 255),
    b: Math.round(hue2rgb(h - 1 / 3) * 255),
  };
}

/** Parsea un fragmento de texto según formato ('HEX'|'RGB'|'HSL') → { r, g, b } o null. */
export function parseColor(raw, format) {
  const value = String(raw || '').trim();
  let rgb = null;
  if (format === 'HEX') {
    rgb = hexToRgb(value);
  } else if (format === 'RGB') {
    const m = value.match(/rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/i);
    if (m) rgb = { r: parseFloat(m[1]), g: parseFloat(m[2]), b: parseFloat(m[3]) };
  } else if (format === 'HSL') {
    const m = value.match(/hsla?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)%?\s*[, ]\s*([\d.]+)%?/i);
    if (m) rgb = hslToRgb(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
  }
  if (!rgb || [rgb.r, rgb.g, rgb.b].some((v) => !Number.isFinite(v) || v < 0 || v > 255)) return null;
  return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) };
}

/** Representación CSS de cada formato a partir de {r,g,b}. */
export function formatsFromRgb(rgb) {
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  return {
    hex,
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
  };
}