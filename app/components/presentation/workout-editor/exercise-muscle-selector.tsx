import { spacing } from '@/hooks/useAppTheme';
import {
  getMuscleGroupTranslationKey,
  humanizeMuscleGroupId,
  normalizeMuscleGroupIds,
} from '@/models/muscle-groups';
import { useAppSelector } from '@/store';
import { selectMuscles } from '@/store/stored-sessions';
import { T, useTranslate } from '@tolgee/react';
import { View } from 'react-native';
import { Chip, Text } from 'react-native-paper';

export default function ExerciseMuscleSelector(props: {
  muscles: string[];
  onChange: (muscles: string[]) => void;
}) {
  const { t } = useTranslate();
  const { muscles, onChange } = props;
  const muscleList = useAppSelector(selectMuscles);
  const selectedMuscles = normalizeMuscleGroupIds(muscles);
  return (
    <View style={{ gap: spacing[2] }}>
      <Text variant="labelLarge">
        <T keyName="muscles.muscle.label" />
      </Text>
      <View
        style={{
          flexDirection: 'row',
          gap: spacing[1],
          flexWrap: 'wrap',
        }}
      >
        {muscleList.map((x) => (
          <Chip
            mode="outlined"
            key={x}
            onPress={() => {
              onChange(
                selectedMuscles.includes(x)
                  ? selectedMuscles.filter((musc) => musc !== x)
                  : selectedMuscles.concat([x]),
              );
            }}
            showSelectedOverlay
            selected={selectedMuscles.includes(x)}
            testID={`exercise-muscle-chip`}
          >
            {t(getMuscleGroupTranslationKey(x) as never, {
              defaultValue: humanizeMuscleGroupId(x),
            })}
          </Chip>
        ))}
      </View>
    </View>
  );
}
