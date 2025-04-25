import { url } from "../../script/config.js";
import { getWeekNumber, getWeekDays, getWeekRangeFromYearAndWeek } from "../../script/utils.js";

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

  if (!window.pageCache) {
    window.pageCache = {
      cachedWeek: getWeekNumber(new Date()),
      pages: {}
    };
  }

  const actualWeek = getWeekNumber(new Date());

  if (window.pageCache.cachedWeek !== actualWeek) {
    const diff = actualWeek - window.pageCache.cachedWeek;
    const newPages = {};

    Object.keys(window.pageCache.pages).forEach(key => {
      const [kYear, kWeek] = key.split('-').map(Number);
      const newKey = `${kYear}-${kWeek + diff}`;
      newPages[newKey] = window.pageCache.pages[key];
    });

    window.pageCache.pages = newPages;
    window.pageCache.cachedWeek = actualWeek;
  }

  const cacheKey = `${year}-${week}`;

  if (!forceFetch && window.pageCache.pages[cacheKey]) {
    return window.pageCache.pages[cacheKey];
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

  window.pageCache.pages[cacheKey] = entries;

  return entries;
}