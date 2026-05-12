import { LocalDate } from '@js-joda/core';

const windowDays = 90;

export function calculateAverageSessionsPerWeek(
  sessionDates: readonly LocalDate[],
  today: LocalDate,
) {
  const firstIncludedDate = today.minusDays(windowDays - 1);
  const sessionCount = sessionDates.filter(
    (date) =>
      (date.isAfter(firstIncludedDate) || date.isEqual(firstIncludedDate)) &&
      (date.isBefore(today) || date.isEqual(today)),
  ).length;

  return {
    sessionCount,
    sessionsPerWeek: sessionCount / (windowDays / 7),
  };
}
