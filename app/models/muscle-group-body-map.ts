import type { Slug } from 'react-native-body-highlighter';
import type { MuscleGroupId } from '@/models/muscle-groups';

export type BodySide = 'front' | 'back';

export type BodyPartTarget = {
  slug: Slug;
  side?: 'left' | 'right';
};

export const BODY_PARTS_BY_MUSCLE: Partial<
  Record<MuscleGroupId, BodyPartTarget[]>
> = {
  chest: [{ slug: 'chest' }],
  shoulders: [{ slug: 'deltoids' }],
  biceps: [{ slug: 'biceps' }],
  triceps: [{ slug: 'triceps' }],
  forearms: [{ slug: 'forearm' }],
  abs: [{ slug: 'abs' }],
  obliques: [{ slug: 'obliques' }],
  traps: [{ slug: 'trapezius' }],
  lats: [{ slug: 'upper-back' }],
  upper_back: [{ slug: 'upper-back' }],
  lower_back: [{ slug: 'lower-back' }],
  glutes: [{ slug: 'gluteal' }],
  quads: [{ slug: 'quadriceps' }],
  hamstrings: [{ slug: 'hamstring' }],
  calves: [{ slug: 'calves' }],
  adductors: [{ slug: 'adductors' }],
  abductors: [{ slug: 'gluteal' }],
} as const;

export const BODY_SLUG_TO_MUSCLE = new Map<Slug, MuscleGroupId>(
  Object.entries(BODY_PARTS_BY_MUSCLE).flatMap(([muscleId, targets]) =>
    (targets ?? []).map((target) => [target.slug, muscleId as MuscleGroupId]),
  ),
);

const enabledBodySlugs = new Set(BODY_SLUG_TO_MUSCLE.keys());

export const DISABLED_BODY_SLUGS: Slug[] = [
  'ankles',
  'feet',
  'hair',
  'hands',
  'head',
  'knees',
  'neck',
  'tibialis',
].filter((slug) => !enabledBodySlugs.has(slug as Slug)) as Slug[];
