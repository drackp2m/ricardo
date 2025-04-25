import { url } from '../../../script/config.js';
import { getWeekDaysByOffset, getWeekRangeFromYearAndWeek } from '../../../script/utils.js';
import { WorkHistoryCache } from './work-history-cache.js';

/**
 * @typedef {Object} PageData
 * @property {string} date
 * @property {string|null} entryTime
 * @property {string|null} in
 * @property {string|null} out
 * @property {string|null} break
 * @property {string|null} total
 */

/**
 * @param {number} year
 * @param {number} week
 * @param {boolean} [forceFetch]
 * @returns {Promise<PageData[]>}
 */
export async function fetchPage(year, week, forceFetch = false) {
  const GOOGLE_SCRIPT_URL = url.googleSheets;
  const userUuid = localStorage.getItem('userUuid');

  if (!userUuid) {
    window.location.href = url.basePathname;

    return [];
  }

  if (!forceFetch) {
    const cached = WorkHistoryCache.get(year, week);

    if (cached) {
      return cached;
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

export function setInfoToHtml(year, week) {
  const weekDays = getWeekRangeFromYearAndWeek(year, week);

  const weekInfo = document.getElementById('week-info');
  const weekNumber = document.getElementById('week-number');
  const from = document.getElementById('from');
  const to = document.getElementById('to');

  const localeDateStringOptions = { year: 'numeric', month: 'short', day: '2-digit' };

  from.innerHTML = new Date(weekDays.from).toLocaleDateString('en-US', localeDateStringOptions);
  to.innerHTML = new Date(weekDays.to).toLocaleDateString('en-US', localeDateStringOptions);

  weekInfo.classList.remove('hidden');

  weekNumber.innerHTML = `Week ${week} of ${year}`;
}
