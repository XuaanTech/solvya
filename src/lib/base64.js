/**
 * Codificación y decodificación Base64 (UTF-8) local en el navegador.
 */

/**
 * Codifica una cadena de texto a Base64 (UTF-8).
 */
export function encodeBase64(str) {
  const bytes = new TextEncoder().encode(String(str));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/**
 * Decodifica una cadena Base64 a texto UTF-8.
 * Devuelve { ok: true, value } o { ok: false, value: '' } si el input no es Base64 válido.
 */
export function decodeBase64(str) {
  let s = String(str).trim().replace(/\s+/g, '');
  if (!s) return { ok: true, value: '' };
  // Comprueba caracteres válidos; la longitud debe ser múltiplo de 4 (con ≤ 2 '=' al final).
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(s) || s.length % 4 === 1) {
    return { ok: false, value: '' };
  }
  try {
    const bin = atob(s);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    const text = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    return { ok: true, value: text };
  } catch {
    return { ok: false, value: '' };
  }
}
