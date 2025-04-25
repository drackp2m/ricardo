import { url } from "../../script/config.js";
import { getWeekNumberByDate, getWeekDaysByOffset, getWeekRangeFromYearAndWeek } from "../../script/utils.js";
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
  const userUuid = localStorage.getItem("userUuid");

  if (!userUuid) {
    window.location.href = url.basePathname;
    return [];
  }

  // Use persistent cache
  if (!forceFetch) {
    const cached = WorkHistoryCache.get(year, week);
    if (cached) return cached;
  }

  const { from, to } = getWeekRangeFromYearAndWeek(year, week);

  const body = new URLSearchParams({
    action: "getEntriesBetweenDates",
    userUuid,
    from,
    to,
  });

  const response = await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body });
  const { entries } = await response.json();

  WorkHistoryCache.set(year, week, entries);

  return entries;
}

export class WorkHistoryCache {
  static CACHE_KEY = 'workHistoryCache';

  static getAll() {
    const raw = localStorage.getItem(WorkHistoryCache.CACHE_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  static get(year, week) {
    const all = WorkHistoryCache.getAll();
    const key = `${year}-${week}`;
    return all[key] || null;
  }

  static set(year, week, data) {
    const all = WorkHistoryCache.getAll();
    const key = `${year}-${week}`;
    all[key] = data;
    localStorage.setItem(WorkHistoryCache.CACHE_KEY, JSON.stringify(all));
  }

  static clear() {
    localStorage.removeItem(WorkHistoryCache.CACHE_KEY);
  }
}