export function map(x) {
  if (x < 30) return 1;
  if (x >= 30 && x < 60) return 2;
  if (x >= 60 && x < 120) return 3;
  if (x >= 120 && x < 180) return 4;
  if (x >= 180 && x <= 300) return 5;
  throw new Error(`nilai waktu tidak valid: ${x}`);
}
