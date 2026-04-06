import FullHeightScrollView from '@/components/layout/full-height-scroll-view';
import EmptyInfo from '@/components/presentation/foundation/empty-info';
import { Remote } from '@/components/presentation/foundation/remote';
import { SegmentedList } from '@/components/presentation/foundation/segmented-list';
import SingleValueStatisticCard from '@/components/presentation/stats/single-value-statistic-card';
import { SingleValueStatisticsGrid } from '@/components/presentation/stats/single-value-statistics-grid';
import { TimePeriodSelector } from '@/components/presentation/stats/time-period-selector';
import { TitledSection } from '@/components/presentation/stats/titled-section';
import { WeightedExerciseStatSummary } from '@/components/presentation/stats/weighted-exercise-stat-summary';
import { spacing } from '@/hooks/useAppTheme';
import {
  getMuscleGroupTranslationKey,
  humanizeMuscleGroupId,
  normalizeMuscleGroupIds,
} from '@/models/muscle-groups';
import { NormalizedName } from '@/models/blueprint-models';
import { useAppSelector } from '@/store';
import { selectExercises } from '@/store/stored-sessions';
import {
  selectOverallView,
  setOverallViewTime,
  WeightedExerciseStatistics,
} from '@/store/stats';
import { T, useTranslate } from '@tolgee/react';
import { Stack } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router/build/hooks';
import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';

type MuscleGroupViewModel = {
  averageWeeklySets: number;
  exercises: WeightedExerciseStatistics[];
  title: string;
};

export default function ExpandedMuscleGroupPage() {
  const dispatch = useDispatch();
  const timePeriod = useAppSelector((x) => x.stats.overallViewTime);
  const exercises = useAppSelector(selectExercises);
  const stats = useAppSelector(selectOverallView);
  const { t } = useTranslate();
  const { dismissTo, push } = useRouter();
  const { muscleGroupId } = useLocalSearchParams<{ muscleGroupId: string }>();

  useEffect(() => {
    if (!muscleGroupId) {
      dismissTo('/(tabs)/data/index');
    }
  }, [dismissTo, muscleGroupId]);

  const muscleGroupStats = useMemo(
    () =>
      stats.map((loadedStats): MuscleGroupViewModel => {
        const musclesByExerciseName = new Map<string, string[]>();
        Object.values(exercises).forEach((exercise) => {
          musclesByExerciseName.set(
            new NormalizedName(exercise.name).toString(),
            normalizeMuscleGroupIds(exercise.muscles ?? []),
          );
        });

        const matchingExercises = loadedStats.weightedExerciseStats.filter(
          (exerciseStats) =>
            musclesByExerciseName
              .get(new NormalizedName(exerciseStats.exerciseName).toString())
              ?.includes(muscleGroupId),
        );

        return {
          averageWeeklySets: matchingExercises.reduce(
            (total, exerciseStats) => total + exerciseStats.setsPerWeek,
            0,
          ),
          exercises: matchingExercises,
          title: t(getMuscleGroupTranslationKey(muscleGroupId) as never, {
            defaultValue: humanizeMuscleGroupId(muscleGroupId),
          }),
        };
      }),
    [exercises, muscleGroupId, stats, t],
  );

  return (
    <FullHeightScrollView
      contentContainerStyle={{
        gap: spacing[2],
        paddingBottom: spacing[6],
      }}
    >
      <Stack.Screen
        options={{
          title: t(getMuscleGroupTranslationKey(muscleGroupId) as never, {
            defaultValue: humanizeMuscleGroupId(muscleGroupId),
          }),
        }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <TimePeriodSelector
          timePeriod={timePeriod}
          setTimePeriod={(value) => dispatch(setOverallViewTime(value))}
        />
      </View>
      <Remote
        value={muscleGroupStats}
        success={(value) =>
          value.exercises.length ? (
            <View style={{ gap: spacing[4] }}>
              <TitledSection title={value.title}>
                <SingleValueStatisticsGrid>
                  <SingleValueStatisticCard
                    title={t('stats.exercise.sets_per_week.label')}
                    icon="function"
                    value={formatWeeklyRate(value.averageWeeklySets)}
                  />
                </SingleValueStatisticsGrid>
              </TitledSection>
              <TitledSection title={t('exercise.exercises.title')}>
                <SegmentedList
                  items={value.exercises}
                  onItemPress={(item) =>
                    push(
                      `/(tabs)/data/expanded-weighted-exercise?exerciseName=${encodeURIComponent(
                        item.exerciseName,
                      )}`,
                    )
                  }
                  renderItem={(item) => (
                    <WeightedExerciseStatSummary exerciseStats={item} />
                  )}
                />
              </TitledSection>
            </View>
          ) : (
            <EmptyInfo>
              <T keyName="stats.no_data.message" />
            </EmptyInfo>
          )
        }
      />
    </FullHeightScrollView>
  );
}

function formatWeeklyRate(value: number) {
  return Math.abs(value - Math.round(value)) < 0.05
    ? Math.round(value).toString()
    : value.toFixed(1);
}
