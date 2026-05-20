export const CATEGORIES = [
  { slug: 'pvc',       label: 'PVC Fittings & Pipes',   icon: 'PipeIcon',      pattern: 'pvc' },
  { slug: 'hdpe',      label: 'HDPE Fittings & Pipes',  icon: 'HdpeIcon',      pattern: 'hdpe' },
  { slug: 'sprinkler', label: 'Sprinkler Systems',       icon: 'SprinklerIcon', pattern: 'sprinkler' },
  { slug: 'tapes',     label: 'Drip Tapes',              icon: 'TapeIcon',      pattern: 'tape' },
  { slug: 'valves',    label: 'Valves & Accessories',    icon: 'ValveIcon',     pattern: 'valve' },
  { slug: 'pumps',     label: 'Pumps',                   icon: 'PumpIcon',      pattern: 'pump' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export function getCategoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}
