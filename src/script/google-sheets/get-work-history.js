import { url } from '../config.js';
import { getWeekRangeFromYearAndWeek } from '../utils.js';
import { WorkHistoryCache } from '../work-history-cache.js';

export async function getWorkHistory(year, week, useCache) {
  const GOOGLE_SCRIPT_URL = url.googleSheets;
  const userUuid = localStorage.getItem('userUuid');

  if (userUuid === null) {
    window.location.href = url.basePathname;

    return [];
  }

  if (useCache === true) {
    const cached = WorkHistoryCache.get(year, week);

    if (cached) {
      return cached.data;
    }
  }

  const { from, to } = getWeekRangeFromYearAndWeek(year, week);

  const body = new URLSearchParams({
    action: 'getEntriesBetweenDates',
    userUuid,
    from,
    to,
  });

  const response = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body });
  const { entries } = await response.json();

  WorkHistoryCache.set(year, week, entries);

  return entries;
}
