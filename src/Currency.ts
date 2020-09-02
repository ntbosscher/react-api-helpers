
export type Cents = number;

export function formatCents(n: Cents | undefined) {
  if (n === undefined) return "0.00";

  n = Math.round(n);
  const dollars = Math.floor(n / 100);
  const cents = (n % 100).toString().padStart(2, "0");

  return `${dollars}.${cents}`;
}

export function parseCents(str: string): number {
  const parts = str.split(".");
  const dollars = parseInt(parts[0], 10);
  let cents = 0;
  if (parts.length >= 2) {
    cents = parseInt(parts[1].substring(0, 2).padEnd(2, "0"), 10);
  }

  return Math.round(dollars * 100 + cents);
}