/**
 * Tasas de cambio orientativas. Actualizar manualmente cada pocas semanas.
 * Fuente típica: ECB o Banco de España (publican cada lunes).
 *
 * Bases:
 *  - EUR = 1
 *  - Cada valor = cuántas unidades de esa moneda equivalen a 1 EUR
 */
export const BASE = 'EUR';
export const LAST_UPDATED = '2026-09-01';

export const RATES = {
  EUR: 1,
  USD: 1.17,
  GBP: 0.86,
  JPY: 178.50,
  CHF: 0.96,
  CAD: 1.58,
  AUD: 1.72,
  MXN: 22.50,
  ARS: 1050,
  BRL: 5.85,
  CNY: 8.42,
  INR: 97.80,
  KRW: 1540,
  SEK: 11.35,
  NOK: 11.52,
  DKK: 7.46,
  PLN: 4.32,
  CZK: 25.15,
  TRY: 38.90,
  ZAR: 21.40,
};

export const CURRENCY_NAMES = {
  EUR: 'Euro',
  USD: 'Dólar estadounidense',
  GBP: 'Libra esterlina',
  JPY: 'Yen japonés',
  CHF: 'Franco suizo',
  CAD: 'Dólar canadiense',
  AUD: 'Dólar australiano',
  MXN: 'Peso mexicano',
  ARS: 'Peso argentino',
  BRL: 'Real brasileño',
  CNY: 'Yuan chino',
  INR: 'Rupia india',
  KRW: 'Won surcoreano',
  SEK: 'Corona sueca',
  NOK: 'Corona noruega',
  DKK: 'Corona danesa',
  PLN: 'Zloty polaco',
  CZK: 'Corona checa',
  TRY: 'Lira turca',
  ZAR: 'Rand sudafricano',
};

export const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
  CHF: 'CHF',
  CAD: 'C$',
  AUD: 'A$',
  MXN: 'MX$',
  ARS: 'AR$',
  BRL: 'R$',
  CNY: '¥',
  INR: '₹',
  KRW: '₩',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  TRY: '₺',
  ZAR: 'R',
};