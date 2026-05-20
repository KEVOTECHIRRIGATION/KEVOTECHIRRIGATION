export const CATEGORIES = [
  { slug: 'pvc',       label: 'PVC Fittings & Pipes',   icon: '💧', pattern: 'pvc' },
  { slug: 'hdpe',      label: 'HDPE Fittings & Pipes',  icon: '🚰', pattern: 'hdpe' },
  { slug: 'sprinkler', label: 'Sprinkler Systems',       icon: '⛲', pattern: 'sprinkler' },
  { slug: 'tapes',     label: 'Drip Tapes',              icon: '🔧', pattern: 'tape' },
  { slug: 'valves',    label: 'Valves & Accessories',    icon: '🔩', pattern: 'valve' },
  { slug: 'pumps',     label: 'Pumps',                   icon: '⚙️', pattern: 'pump' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}
