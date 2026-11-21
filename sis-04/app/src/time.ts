// Pure helpers for the time inputs. Minutes after midnight: 600 = 10:00, 1440 = 24:00.
export const toMinutes = (value: string): number => {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
};

export const fmt = (m: number): string =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
