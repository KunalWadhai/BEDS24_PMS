
export const DEFAULT_RANK = {
  'superior': 1,
  'deluxe':   2,
  'delux':    2, 
  'standard': 3
};

export function getImmediateBetterType(allNames = [], baseName, overrides = {}) {
  const map = { ...DEFAULT_RANK };
  for (const k in overrides) map[k.toLowerCase()] = Number(overrides[k]);

  const base = (baseName || '').toLowerCase();
  const baseRank = map[base] ?? Number.POSITIVE_INFINITY;

  const candidates = allNames
    .map(n => ({ name: n, key: (n||'').toLowerCase(), rank: map[(n||'').toLowerCase()] ?? Number.POSITIVE_INFINITY }))
    .filter(x => x.rank < baseRank)
    .sort((a,b) => a.rank - b.rank);

  return candidates.length ? candidates[0].name : null;
}
