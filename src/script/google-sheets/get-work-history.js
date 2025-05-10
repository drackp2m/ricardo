import { url } from '../config.js';
import { httpClient } from '../http-client.js';
import { getWeekRangeFromYearAndWeek } from '../utils.js';
import { WorkHistoryCache } from '../work-history-cache.js';

/**
 * @template T
 * @typedef {import('../../definition/google-sheets/google-sheets.response.mjs').GoogleSheetsResponse<T>} GoogleSheetsResponse<T>
 */

/**
 * @typedef {import('../../definition/google-sheets/get-entries-between-dates.response.mjs').GetEntriesBetweenDatesResponse} GetEntriesBetweenDatesResponse
 *
 * @param {number} year
 * @param {number} week
 * @param {boolean} useCache
 * @returns {Promise<GoogleSheetsResponse<GetEntriesBetweenDatesResponse[]>>}
 */
export async function getWorkHistory(year, week, useCache) {
  if (useCache === true) {
    const cached = WorkHistoryCache.get(year, week);

    if (cached !== null) {
      return { success: true, data: cached.data };
    }
  }

  const { from, to } = getWeekRangeFromYearAndWeek(year, week);

  return httpClient.request({ action: 'getEntriesBetweenDates', from, to }).then((response) => {
    WorkHistoryCache.set(year, week, response.data);

    return response;
  });
}
