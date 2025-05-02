import { url } from '../config.js';
import { getWeekRangeFromYearAndWeek } from '../utils.js';
import { WorkHistoryCache } from '../work-history-cache.js';

/**
 * @template T
 * @typedef {import('../../definition/google-sheets/google-sheets.response.mjs').GoogleSheetsResponse<T>} GoogleSheetsResponse<T>
 */

/**
 * @typedef {import('../../definition/google-sheets/get-entries-between-dates.response.mjs').GetEntriesBetweenDatesResponse} GetEntriesBetweenDatesResponse
 */

/**
 * @param {number} year
 * @param {number} week
 * @param {boolean} useCache
 * @returns {Promise<GoogleSheetsResponse<GetEntriesBetweenDatesResponse[]>>}
 */
export async function getWorkHistory(year, week, useCache) {
  const GOOGLE_SCRIPT_URL = url.googleSheets;
  const userUuid = localStorage.getItem('userUuid');

  if (userUuid === null) {
    window.location.href = url.basePathname;

    return { success: false, error: 'User UUID is null' };
  }

  if (useCache === true) {
    const cached = WorkHistoryCache.get(year, week);

    if (cached) {
      return { success: true, data: cached.data };
    }
  }

  const { from, to } = getWeekRangeFromYearAndWeek(year, week);

  const request = new URLSearchParams({
    action: 'getEntriesBetweenDates',
    userUuid,
    from,
    to,
  });

  return await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: request })
    .then((res) => res.json())
    .then((response) => {
      WorkHistoryCache.set(year, week, response.data);
    
      return response;
    })
    .catch((error) => {
      return { success: false, error: error.message };
    });
}
