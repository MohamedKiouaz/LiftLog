import { font, spacing, useAppTheme } from '@/hooks/useAppTheme';
import {
  BODY_PARTS_BY_MUSCLE,
  DISABLED_BODY_SLUGS,
  type BodySide,
} from '@/models/muscle-group-body-map';
import {
  getMuscleGroupTranslationKey,
  humanizeMuscleGroupId,
  type MuscleGroupId,
} from '@/models/muscle-groups';
import { useTranslate } from '@tolgee/react';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Body, { type ExtendedBodyPart, type Slug } from 'react-native-body-highlighter';
import { Text } from 'react-native-paper';

type LabelAnchor = {
  top: number;
  left: number;
};

type MuscleHeatValue = {
  id: MuscleGroupId;
  value: number;
};

const LABEL_ANCHORS: Partial<
  Record<MuscleGroupId, Partial<Record<BodySide, LabelAnchor>>>
> = {
  chest: { front: { top: 23, left: 50 } },
  shoulders: { front: { top: 20, left: 50 } },
  biceps: { front: { top: 27, left: 26 } },
  triceps: { back: { top: 26, left: 24 } },
  forearms: { front: { top: 38, left: 19 }, back: { top: 38, left: 19 } },
  abs: { front: { top: 35, left: 50 } },
  obliques: { front: { top: 35, left: 28 } },
  traps: { back: { top: 19, left: 50 } },
  lats: { back: { top: 29, left: 71 } },
  upper_back: { back: { top: 28, left: 50 } },
  lower_back: { back: { top: 40, left: 50 } },
  glutes: { back: { top: 51, left: 50 } },
  quads: { front: { top: 55, left: 50 } },
  hamstrings: { back: { top: 59, left: 50 } },
  calves: { back: { top: 79, left: 50 } },
  adductors: { front: { top: 58, left: 39 } },
  abductors: { front: { top: 54, left: 67 }, back: { top: 54, left: 67 } },
};

export function MuscleGroupHeatmap({
  values,
}: {
  values: ReadonlyArray<MuscleHeatValue>;
}) {
  const { t } = useTranslate();
  const { colors } = useAppTheme();

  const maxValue = useMemo(
    () => Math.max(...values.map((value) => value.value), 1),
    [values],
  );

  const bodyData = useMemo<ExtendedBodyPart[]>(() => {
    const strongestValueByTarget = new Map<string, number>();

    values.forEach(({ id, value }) => {
      (BODY_PARTS_BY_MUSCLE[id] ?? []).forEach((target) => {
        const key = `${target.slug}:${target.side ?? 'both'}`;
        const current = strongestValueByTarget.get(key) ?? 0;
        if (value > current) {
          strongestValueByTarget.set(key, value);
        }
      });
    });

    return Array.from(strongestValueByTarget.entries()).map(([key, value]) => {
      const [slug, sideValue] = key.split(':');
      const fill = getHeatColor(
        value / maxValue,
        colors.surfaceVariant,
        colors.primaryContainer,
        colors.errorContainer,
      );
      const stroke = getHeatColor(
        value / maxValue,
        colors.outline,
        colors.primary,
        colors.error,
      );

      return {
        slug: slug as Slug,
        ...(sideValue === 'both'
          ? {}
          : { side: sideValue as 'left' | 'right' }),
        styles: {
          fill,
          stroke,
          strokeWidth: 2,
        },
      } satisfies ExtendedBodyPart;
    });
  }, [
    colors.error,
    colors.errorContainer,
    colors.outline,
    colors.primary,
    colors.primaryContainer,
    colors.surfaceVariant,
    maxValue,
    values,
  ]);

  return (
    <View style={styles.root}>
      <Text variant="bodySmall">{t('stats.exercise.sets_per_week.label')}</Text>
      <View style={styles.bodyMapRow}>
        <View style={styles.bodyMapColumn}>
          <Text variant="labelMedium" style={styles.bodyLabel}>
            {t('exercise.muscle_groups.body_map.front.button')}
          </Text>
          {renderBodyMap({
            side: 'front',
            values,
            bodyData,
            maxValue,
            colors,
          })}
        </View>
        <View style={styles.bodyMapColumn}>
          <Text variant="labelMedium" style={styles.bodyLabel}>
            {t('exercise.muscle_groups.body_map.back.button')}
          </Text>
          {renderBodyMap({
            side: 'back',
            values,
            bodyData,
            maxValue,
            colors,
          })}
        </View>
      </View>
      <View style={styles.legendWrap}>
        {values.map((value) => (
          <View key={value.id} style={styles.legendItem}>
            <View
              style={[
                styles.legendSwatch,
                {
                  backgroundColor: getHeatColor(
                    value.value / maxValue,
                    colors.surfaceVariant,
                    colors.primaryContainer,
                    colors.errorContainer,
                  ),
                },
              ]}
            />
            <Text variant="bodySmall" style={styles.legendText}>
              {t(getMuscleGroupTranslationKey(value.id) as never, {
                defaultValue: humanizeMuscleGroupId(value.id),
              })}
              {' - '}
              {Math.round(value.value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function renderBodyMap({
  side,
  values,
  bodyData,
  maxValue,
  colors,
}: {
  side: BodySide;
  values: ReadonlyArray<MuscleHeatValue>;
  bodyData: ReadonlyArray<ExtendedBodyPart>;
  maxValue: number;
  colors: ReturnType<typeof useAppTheme>['colors'];
}) {
  const visibleLabels = values
    .filter((value) => LABEL_ANCHORS[value.id]?.[side])
    .map((value) => ({
      ...value,
      anchor: LABEL_ANCHORS[value.id]?.[side] as LabelAnchor,
      badgeColor: getHeatColor(
        value.value / maxValue,
        colors.surfaceVariant,
        colors.primaryContainer,
        colors.errorContainer,
      ),
    }));

  return (
    <View style={styles.bodyMapFrame}>
      <View style={styles.bodyMapCanvas}>
        <Body
          data={bodyData}
          side={side}
          gender="male"
          scale={0.78}
          border={colors.outlineVariant}
          defaultFill={colors.surface}
          defaultStroke={colors.outline}
          defaultStrokeWidth={2}
          disabledParts={DISABLED_BODY_SLUGS}
        />
        {visibleLabels.map((value) => (
          <View
            key={`${side}-${value.id}`}
            pointerEvents="none"
            style={[
              styles.labelBadge,
              {
                top: `${value.anchor.top}%`,
                left: `${value.anchor.left}%`,
                backgroundColor: value.badgeColor,
              },
            ]}
          >
            <Text
              style={[
                styles.labelText,
                { color: getContrastingTextColor(value.badgeColor) },
              ]}
            >
              {Math.round(value.value)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function getHeatColor(
  intensity: number,
  lowColor: string,
  midColor: string,
  highColor: string,
) {
  const clamped = Math.max(0, Math.min(1, intensity));
  if (clamped <= 0.5) {
    return mixColors(lowColor, midColor, clamped / 0.5);
  }
  return mixColors(midColor, highColor, (clamped - 0.5) / 0.5);
}

function mixColors(startColor: string, endColor: string, weight: number) {
  const start = parseHexColor(startColor);
  const end = parseHexColor(endColor);
  const clampedWeight = Math.max(0, Math.min(1, weight));

  const red = Math.round(start.red + (end.red - start.red) * clampedWeight);
  const green = Math.round(
    start.green + (end.green - start.green) * clampedWeight,
  );
  const blue = Math.round(start.blue + (end.blue - start.blue) * clampedWeight);

  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

function parseHexColor(color: string) {
  const normalized = color.replace('#', '');
  const hex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((value) => value + value)
          .join('')
      : normalized;

  return {
    red: Number.parseInt(hex.slice(0, 2), 16),
    green: Number.parseInt(hex.slice(2, 4), 16),
    blue: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function toHex(value: number) {
  return value.toString(16).padStart(2, '0');
}

function getContrastingTextColor(backgroundColor: string) {
  const { red, green, blue } = parseHexColor(backgroundColor);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;
  return luminance > 150 ? '#111111' : '#ffffff';
}

const styles = StyleSheet.create({
  root: {
    gap: spacing[2],
  },
  bodyMapRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing[2],
  },
  bodyMapColumn: {
    flex: 1,
    alignItems: 'center',
    gap: spacing[1],
  },
  bodyLabel: {
    textAlign: 'center',
  },
  bodyMapFrame: {
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bodyMapCanvas: {
    width: 170,
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelBadge: {
    position: 'absolute',
    minWidth: 24,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: spacing[1],
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -12 }, { translateY: -10 }],
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  labelText: {
    ...font['text-2xs'],
    fontWeight: '700',
  },
  legendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1],
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    minWidth: '48%',
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendText: {
    flexShrink: 1,
  },
});
