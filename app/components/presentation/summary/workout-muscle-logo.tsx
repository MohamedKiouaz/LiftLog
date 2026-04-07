import { spacing, useAppTheme } from '@/hooks/useAppTheme';
import { NormalizedName } from '@/models/blueprint-models';
import {
  BODY_PARTS_BY_MUSCLE,
  DISABLED_BODY_SLUGS,
  type BodySide,
} from '@/models/muscle-group-body-map';
import { type Session } from '@/models/session-models';
import {
  KNOWN_MUSCLE_GROUP_IDS,
  normalizeMuscleGroupIds,
  type MuscleGroupId,
} from '@/models/muscle-groups';
import { useAppSelector } from '@/store';
import { selectExercises } from '@/store/stored-sessions';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Body, { type ExtendedBodyPart } from 'react-native-body-highlighter';

type Anchor = {
  x: number;
  y: number;
};

type CropWindow = {
  centerX: number;
  centerY: number;
  scale: number;
};

const SIDE_ANCHORS: Partial<
  Record<MuscleGroupId, Partial<Record<BodySide, Anchor>>>
> = {
  chest: { front: { x: 50, y: 25 } },
  shoulders: {
    front: { x: 50, y: 20 },
    back: { x: 50, y: 20 },
  },
  biceps: { front: { x: 23, y: 28 } },
  triceps: { back: { x: 24, y: 28 } },
  forearms: {
    front: { x: 18, y: 40 },
    back: { x: 18, y: 40 },
  },
  abs: { front: { x: 50, y: 37 } },
  obliques: { front: { x: 31, y: 38 } },
  traps: { back: { x: 50, y: 18 } },
  lats: { back: { x: 68, y: 31 } },
  upper_back: { back: { x: 50, y: 29 } },
  lower_back: { back: { x: 50, y: 42 } },
  glutes: { back: { x: 50, y: 53 } },
  quads: { front: { x: 50, y: 58 } },
  hamstrings: { back: { x: 50, y: 60 } },
  calves: { back: { x: 50, y: 81 } },
  adductors: { front: { x: 42, y: 61 } },
  abductors: {
    front: { x: 63, y: 55 },
    back: { x: 63, y: 55 },
  },
};

const BODY_CANVAS_WIDTH = 170;
const BODY_CANVAS_HEIGHT = 360;
const BODY_BASE_SCALE = 0.78;

export default function WorkoutMuscleLogo({ session }: { session: Session }) {
  const { colors } = useAppTheme();
  const savedExercises = useAppSelector(selectExercises);

  const musclesByExerciseName = useMemo(() => {
    const result = new Map<string, string[]>();
    Object.values(savedExercises).forEach((exercise) => {
      const key = new NormalizedName(exercise.name).toString();
      const existing = result.get(key) ?? [];
      result.set(
        key,
        normalizeMuscleGroupIds([...existing, ...(exercise.muscles ?? [])]),
      );
    });
    return result;
  }, [savedExercises]);

  const muscles = useMemo(
    () =>
      normalizeMuscleGroupIds(
        session.blueprint.exercises.flatMap((exercise) => {
          if (exercise.muscles?.length) {
            return exercise.muscles;
          }
          return (
            musclesByExerciseName.get(
              new NormalizedName(exercise.name).toString(),
            ) ?? []
          );
        }),
      ).filter((value): value is MuscleGroupId =>
        KNOWN_MUSCLE_GROUP_IDS.includes(value as MuscleGroupId),
      ),
    [musclesByExerciseName, session.blueprint.exercises],
  );

  const bodyData = useMemo<ExtendedBodyPart[]>(() => {
    const seen = new Set<string>();
    return muscles.flatMap((muscleId) =>
      (BODY_PARTS_BY_MUSCLE[muscleId] ?? []).flatMap((target) => {
        const key = `${target.slug}:${target.side ?? 'both'}`;
        if (seen.has(key)) {
          return [];
        }
        seen.add(key);
        return [
          {
            slug: target.slug,
            ...(target.side ? { side: target.side } : {}),
            styles: {
              fill: colors.primary,
              stroke: colors.primary,
              strokeWidth: 1.25,
            },
          } satisfies ExtendedBodyPart,
        ];
      }),
    );
  }, [colors.primary, muscles]);

  const frontCrop = useMemo(() => getCropWindow(muscles, 'front'), [muscles]);
  const backCrop = useMemo(() => getCropWindow(muscles, 'back'), [muscles]);

  if (!bodyData.length) {
    return null;
  }

  return (
    <View style={styles.row}>
      <BodySideLogo
        bodyData={bodyData}
        crop={frontCrop}
        side="front"
        highlightColor={colors.primary}
      />
      <BodySideLogo
        bodyData={bodyData}
        crop={backCrop}
        side="back"
        highlightColor={colors.primary}
      />
    </View>
  );
}

function BodySideLogo({
  side,
  crop,
  bodyData,
  highlightColor,
}: {
  side: BodySide;
  crop: CropWindow;
  bodyData: readonly ExtendedBodyPart[];
  highlightColor: string;
}) {
  const scaledCanvasWidth = BODY_CANVAS_WIDTH * crop.scale;
  const scaledCanvasHeight = BODY_CANVAS_HEIGHT * crop.scale;
  const offsetX = ((50 - crop.centerX) / 100) * scaledCanvasWidth;
  const offsetY = ((50 - crop.centerY) / 100) * scaledCanvasHeight;

  return (
    <View style={styles.frame}>
      <View
        style={[
          styles.bodyWrap,
          {
            width: scaledCanvasWidth,
            height: scaledCanvasHeight,
            transform: [{ translateX: offsetX }, { translateY: offsetY }],
          },
        ]}
      >
        <Body
          data={bodyData}
          side={side}
          gender="male"
          scale={BODY_BASE_SCALE * crop.scale}
          border="transparent"
          defaultFill="transparent"
          defaultStroke="transparent"
          defaultStrokeWidth={0}
          disabledParts={DISABLED_BODY_SLUGS}
        />
      </View>
      <View
        pointerEvents="none"
        style={[styles.sideTint, { borderColor: highlightColor }]}
      />
    </View>
  );
}

function getCropWindow(
  muscles: readonly MuscleGroupId[],
  side: BodySide,
): CropWindow {
  const anchors = muscles
    .map((muscleId) => SIDE_ANCHORS[muscleId]?.[side])
    .filter((anchor): anchor is Anchor => !!anchor);

  if (!anchors.length) {
    return {
      centerX: 50,
      centerY: 50,
      scale: 1.2,
    };
  }

  const minX = Math.min(...anchors.map((anchor) => anchor.x));
  const maxX = Math.max(...anchors.map((anchor) => anchor.x));
  const minY = Math.min(...anchors.map((anchor) => anchor.y));
  const maxY = Math.max(...anchors.map((anchor) => anchor.y));

  const paddedWidth = Math.max(maxX - minX + 24, 24);
  const paddedHeight = Math.max(maxY - minY + 24, 24);
  const scale = Math.max(
    1.1,
    Math.min(2.2, Math.min(100 / paddedWidth, 100 / paddedHeight)),
  );

  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    scale,
  };
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    marginTop: spacing[1],
  },
  frame: {
    width: 40,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  bodyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideTint: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    opacity: 0.18,
  },
});
