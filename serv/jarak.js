export function map(x) {
  if (x >= 1 && x < 5) return 1;
  if (x >= 5 && x < 10) return 2;
  if (x >= 10 && x < 50) return 3;
  if (x >= 50 && x < 100) return 4;
  if (x >= 100 && x <= 200) return 5;
  throw new Error(`nilai jarak tidak valid: ${x}`)
}