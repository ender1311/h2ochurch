export type BirthdayPerson = {
  id: string;
  first_name: string;
  last_name: string;
  birthdate: string | null; // YYYY-MM-DD
};

export type UpcomingBirthday = BirthdayPerson & { nextBirthday: Date; turning: number };

/**
 * People whose birthday falls within the next `days` days (inclusive of today),
 * sorted soonest first. Handles year wrap (late Dec → early Jan) and Feb 29
 * (celebrated Mar 1 in non-leap years).
 */
export function upcomingBirthdays(
  people: BirthdayPerson[],
  days: number,
  today: Date = new Date(),
): UpcomingBirthday[] {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const horizon = new Date(startOfToday);
  horizon.setDate(horizon.getDate() + days);

  const out: UpcomingBirthday[] = [];
  for (const p of people) {
    if (!p.birthdate) continue;
    const [y, m, d] = p.birthdate.split("-").map(Number);
    if (!y || !m || !d) continue;

    for (const year of [startOfToday.getFullYear(), startOfToday.getFullYear() + 1]) {
      let next = new Date(year, m - 1, d);
      // Feb 29 in a non-leap year rolls to Mar 1 automatically via Date overflow.
      if (m === 2 && d === 29 && next.getMonth() !== 1) next = new Date(year, 2, 1);
      if (next >= startOfToday && next <= horizon) {
        out.push({ ...p, nextBirthday: next, turning: year - y });
        break;
      }
    }
  }
  return out.sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime());
}
