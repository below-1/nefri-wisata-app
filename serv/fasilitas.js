export function map(x) {
  const n = x.length;
  if (n == 0) {
    throw new Error(`nilai fasilitas tidak valid: ${x}`)
  }
  return n;
}