export type Cents = number;

export function formatCents(n: Cents | undefined) {
  if (n === undefined) return '0.00';

  let isNeg = n < 0;
  if (isNeg) n = n * -1;

  n = Math.round(n);

  const neg = isNeg ? '-' : '';
  const dollars = Math.floor(n / 100);
  const cents = (n % 100).toString().padStart(2, '0');

  return `${neg}${dollars.toLocaleString()}.${cents}`;
}

export function parseCents(str: string): number {
  const parts = str.replace(/[^0-9\-.]+/g, '').split('.');
  let dollars = parseInt(parts[0], 10);
  let cents = 0;
  if (parts.length >= 2) {
    cents = parseInt(parts[1].substring(0, 2).padEnd(2, '0'), 10);
  }

  if(dollars < 0 || str.startsWith("-")) {
    cents = -cents;
  }

  if (isNaN(dollars)) dollars = 0;
  if (isNaN(cents)) cents = 0;

  return Math.round(dollars * 100 + cents);
}
