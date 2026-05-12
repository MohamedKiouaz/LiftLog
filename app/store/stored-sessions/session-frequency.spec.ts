import { describe, expect, it } from 'vitest';
import { LocalDate } from '@js-joda/core';
import { calculateAverageSessionsPerWeek } from './session-frequency';

describe('calculateAverageSessionsPerWeek', () => {
  it('counts sessions in the last 90 days over a fixed 90 day window', () => {
    const today = LocalDate.of(2026, 5, 12);

    const average = calculateAverageSessionsPerWeek(
      [
        LocalDate.of(2026, 5, 12),
        LocalDate.of(2026, 5, 1),
        LocalDate.of(2026, 2, 12),
        LocalDate.of(2026, 2, 11),
      ],
      today,
    );

    expect(average.sessionCount).toBe(3);
    expect(average.sessionsPerWeek).toBeCloseTo(0.23, 2);
  });
});
