export const KNOWN_MUSCLE_GROUP_IDS = [
  'chest',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'obliques',
  'traps',
  'lats',
  'upper_back',
  'lower_back',
  'glutes',
  'quads',
  'hamstrings',
  'calves',
  'adductors',
  'abductors',
] as const;

export type MuscleGroupId = (typeof KNOWN_MUSCLE_GROUP_IDS)[number];

const legacyMuscleAliases: Record<string, MuscleGroupId> = {
  abdominals: 'abs',
  abs: 'abs',
  abductors: 'abductors',
  adductors: 'adductors',
  biceps: 'biceps',
  calves: 'calves',
  chest: 'chest',
  forearms: 'forearms',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  lats: 'lats',
  'lower back': 'lower_back',
  lower_back: 'lower_back',
  'middle back': 'upper_back',
  neck: 'traps',
  obliques: 'obliques',
  quadriceps: 'quads',
  quads: 'quads',
  shoulders: 'shoulders',
  traps: 'traps',
  triceps: 'triceps',
  'upper back': 'upper_back',
  upper_back: 'upper_back',
};

export function normalizeMuscleGroupId(value: string): string {
  const normalized = value.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
  return (
    legacyMuscleAliases[normalized] ??
    normalized.replace(/[^\p{L}\p{N}]+/gu, '_').replace(/^_+|_+$/g, '')
  );
}

export function normalizeMuscleGroupIds(values: readonly string[]): string[] {
  const unique = new Set<string>();
  values
    .map(normalizeMuscleGroupId)
    .filter(Boolean)
    .forEach((value) => unique.add(value));
  return Array.from(unique);
}

export function getMuscleGroupTranslationKey(id: string) {
  return `muscles.group.${id}.label`;
}

export function humanizeMuscleGroupId(id: string) {
  return id
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
