const FNV_OFFSET_BASIS_32 = 0x811c9dc5;
const FNV_PRIME_32 = 0x01000193;

export function hashStringFNV1a32(value: string): number {
  let hash = FNV_OFFSET_BASIS_32;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, FNV_PRIME_32);
  }
  return hash >>> 0;
}

export function createNodeId(seed: string): string {
  return hashStringFNV1a32(seed).toString(36);
}
