import ExerciseSearchAndFilters from '@/components/presentation/workout-editor/exercise-search-and-filters';
import { ExerciseDescriptor } from '@/models/exercise-models';
import { useAppSelector } from '@/store';
import { selectExercises } from '@/store/stored-sessions';
import Enumerable from 'linq';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export default function ExerciseFilterer(props: {
  onFilteredExerciseIdsChange: (ids: string[]) => void;
  onSuggestedNewExercise: (
    exerciseDescriptor: ExerciseDescriptor | 'NONE',
  ) => void;
}) {
  const exercises = useAppSelector(selectExercises);
  const { onFilteredExerciseIdsChange, onSuggestedNewExercise } = props;
  const [muscleFilters, setMuscleFilters] = useState([] as string[]);
  const [searchText, setSearchText] = useState('');

  const search = useDebouncedCallback(() => {
    const trimmed = searchText.trim();
    const escaped = escapeRegExp(trimmed);
    const searchRegex = new RegExp(escaped, 'i');
    const startsWithRegex = new RegExp('^' + escaped, 'i');
    const fullMatchRegex = new RegExp('^' + escaped + '$', 'i');
    let hasExactMatch = false;
    const newFilteredExercises = Enumerable.from(Object.entries(exercises))
      .where(
        (x) =>
          (!muscleFilters.length ||
            x[1].muscles.some((exerciseMuscle) =>
              muscleFilters.includes(exerciseMuscle),
            )) &&
          (!trimmed || searchRegex.test(x[1].name)),
      )
      .doAction((x) => {
        if (!hasExactMatch && trimmed && fullMatchRegex.test(x[1].name)) {
          hasExactMatch = true;
        }
      })
      // If the exercise starts with the search term, then it is a good match and should be brought to the top
      .orderByDescending(
        (x) =>
          (startsWithRegex.test(x[1].name) ? 1 : 0) +
          (fullMatchRegex.test(x[1].name) ? 1 : 0),
      )
      .select((x) => x[0])
      .toArray();
    onFilteredExerciseIdsChange(newFilteredExercises);
    if (!hasExactMatch && searchText) {
      onSuggestedNewExercise({
        name: trimmed,
        category: '',
        equipment: null,
        force: null,
        instructions: '',
        level: '',
        mechanic: '',
        muscles: muscleFilters,
      });
    } else {
      onSuggestedNewExercise('NONE');
    }
  }, 100);

  return (
    <ExerciseSearchAndFilters
      searchText={searchText}
      setSearchText={(s) => {
        setSearchText(s);
        search();
      }}
      muscleFilters={muscleFilters}
      setMuscleFilters={(m) => {
        setMuscleFilters(m);
        search();
      }}
    />
  );
}
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
