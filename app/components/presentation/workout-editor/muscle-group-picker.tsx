import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  getMuscleGroupTranslationKey,
  humanizeMuscleGroupId,
  KNOWN_MUSCLE_GROUP_IDS,
  normalizeMuscleGroupIds,
} from '@/models/muscle-groups';
import { useTranslate } from '@tolgee/react';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Body, {
  type ExtendedBodyPart,
  type Slug,
} from 'react-native-body-highlighter';
import { Card, Chip, SegmentedButtons, Text } from 'react-native-paper';

type BodySide = 'front' | 'back';
type MuscleGroupId = (typeof KNOWN_MUSCLE_GROUP_IDS)[number];

type BodyPartTarget = {
  slug: Slug;
  side?: 'left' | 'right';
};

type PickerProps = {
  muscles: string[];
  onChange: (muscles: string[]) => void;
};

const BODY_PARTS_BY_MUSCLE: Partial<Record<MuscleGroupId, BodyPartTarget[]>> = {
  chest: [{ slug: 'chest' }],
  shoulders: [{ slug: 'deltoids' }],
  biceps: [{ slug: 'biceps' }],
  triceps: [{ slug: 'triceps' }],
  forearms: [{ slug: 'forearm' }],
  abs: [{ slug: 'abs' }],
  obliques: [{ slug: 'obliques' }],
  traps: [{ slug: 'trapezius' }],
  upper_back: [{ slug: 'upper-back' }],
  lower_back: [{ slug: 'lower-back' }],
  glutes: [{ slug: 'gluteal' }],
  quads: [{ slug: 'quadriceps' }],
  hamstrings: [{ slug: 'hamstring' }],
  calves: [{ slug: 'calves' }],
  adductors: [{ slug: 'adductors' }],
} as const;

const BODY_SLUG_TO_MUSCLE = new Map<Slug, MuscleGroupId>(
  Object.entries(BODY_PARTS_BY_MUSCLE).flatMap(([muscleId, targets]) =>
    (targets ?? []).map((target) => [target.slug, muscleId as MuscleGroupId]),
  ),
);

const ENABLED_BODY_SLUGS = new Set(BODY_SLUG_TO_MUSCLE.keys());
const DISABLED_BODY_SLUGS: Slug[] = [
  'ankles',
  'feet',
  'hair',
  'hands',
  'head',
  'knees',
  'neck',
  'tibialis',
].filter((slug) => !ENABLED_BODY_SLUGS.has(slug as Slug)) as Slug[];

export default function MuscleGroupPicker(props: PickerProps) {
  const { colors } = useAppTheme();
  const { t } = useTranslate();
  const [side, setSide] = useState<BodySide>('front');
  const selectedMuscles = useMemo(
    () => normalizeMuscleGroupIds(props.muscles),
    [props.muscles],
  );

  const bodyData = useMemo<ExtendedBodyPart[]>(() => {
    const seen = new Set<string>();
    return selectedMuscles.flatMap((muscleId) =>
      (BODY_PARTS_BY_MUSCLE[muscleId as MuscleGroupId] ?? []).flatMap(
        (target) => {
          const key = `${target.slug}:${target.side ?? 'both'}`;
          if (seen.has(key)) {
            return [];
          }
          seen.add(key);
          return [
            (
              target.side
                ? {
                    slug: target.slug,
                    side: target.side,
                    styles: {
                      fill: colors.primaryContainer,
                      stroke: colors.primary,
                      strokeWidth: 2,
                    },
                  }
                : {
                    slug: target.slug,
                    styles: {
                      fill: colors.primaryContainer,
                      stroke: colors.primary,
                      strokeWidth: 2,
                    },
                  }
            ) satisfies ExtendedBodyPart,
          ];
        },
      ),
    );
  }, [colors.primary, colors.primaryContainer, selectedMuscles]);

  const toggleMuscle = (id: string) => {
    props.onChange(
      selectedMuscles.includes(id)
        ? selectedMuscles.filter((muscle) => muscle !== id)
        : [...selectedMuscles, id],
    );
  };

  return (
    <View style={{ gap: spacing[2] }}>
      {!!selectedMuscles.length && (
        <View style={{ gap: spacing[1] }}>
          <Text variant="bodySmall">
            {t('exercise.muscle_groups.selected.label')}
          </Text>
          <View style={styles.chipWrap}>
            {selectedMuscles.map((id) => (
              <Chip
                key={id}
                mode="flat"
                icon="close"
                onPress={() => toggleMuscle(id)}
              >
                {t(getMuscleGroupTranslationKey(id) as never, {
                  defaultValue: humanizeMuscleGroupId(id),
                })}
              </Chip>
            ))}
          </View>
        </View>
      )}

      <Card mode="contained">
        <Card.Content style={{ gap: spacing[2] }}>
          <Text variant="bodyMedium">
            {t('exercise.muscle_groups.body_map.label')}
          </Text>
          <SegmentedButtons
            value={side}
            onValueChange={(value) => setSide(value as BodySide)}
            buttons={[
              {
                value: 'front',
                label: t('exercise.muscle_groups.body_map.front.button'),
              },
              {
                value: 'back',
                label: t('exercise.muscle_groups.body_map.back.button'),
              },
            ]}
          />
          <View style={styles.bodyMapFrame}>
            <Body
              data={bodyData}
              side={side}
              gender="male"
              scale={0.85}
              border={colors.outlineVariant}
              defaultFill={colors.surfaceVariant}
              defaultStroke={colors.outline}
              defaultStrokeWidth={2}
              disabledParts={DISABLED_BODY_SLUGS}
              onBodyPartPress={(part) => {
                if (!part.slug) {
                  return;
                }
                const muscleId = BODY_SLUG_TO_MUSCLE.get(part.slug);
                if (!muscleId) {
                  return;
                }
                toggleMuscle(muscleId);
              }}
            />
          </View>
        </Card.Content>
      </Card>

      <View style={{ gap: spacing[1] }}>
        <Text variant="bodySmall">{t('exercise.muscle_groups.list.label')}</Text>
        <View style={styles.chipWrap}>
          {KNOWN_MUSCLE_GROUP_IDS.map((id) => (
            <Chip
              key={id}
              mode="outlined"
              selected={selectedMuscles.includes(id)}
              showSelectedOverlay
              onPress={() => toggleMuscle(id)}
            >
              {t(getMuscleGroupTranslationKey(id) as never, {
                defaultValue: humanizeMuscleGroupId(id),
              })}
            </Chip>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bodyMapFrame: {
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
});
