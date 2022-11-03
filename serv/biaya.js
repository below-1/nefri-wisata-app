export function map(x) {
  if (x <= 5000) return 1;
  if (x > 50000 && x < 100000) return 2;
  if (x >= 100000) return 1;
  throw new Error(`nilai biaya tidak valid: ${x}`);
}
