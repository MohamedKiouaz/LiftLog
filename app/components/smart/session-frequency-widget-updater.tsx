import { updateSessionFrequencyWidget } from '@/modules/native-crypto/src/LiftLogWidgetModule';
import { useAppSelector } from '@/store';
import { selectSessions } from '@/store/stored-sessions';
import { calculateAverageSessionsPerWeek } from '@/store/stored-sessions/session-frequency';
import { LocalDate } from '@js-joda/core';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export function SessionFrequencyWidgetUpdater() {
  const sessions = useAppSelector(selectSessions);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    updateSessionFrequencyWidget(
      calculateAverageSessionsPerWeek(
        sessions.map((session) => session.date),
        LocalDate.now(),
      ),
    );
  }, [sessions]);

  return null;
}
