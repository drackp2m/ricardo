import { url } from "/script/config.js";
import { getWeekNumber, getWeekDays } from "/script/utils.js";

export async function fetchPage(pageNumber, forceFetch = false) {
  const GOOGLE_SCRIPT_URL = url.googleSheets;
  const userUuid = localStorage.getItem("userUuid");

  if (!userUuid) {
    window.location.href = "/index.html";
    return;
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
      const newKey = parseInt(key, 10) + diff;
      newPages[newKey] = window.pageCache.pages[key];
    });

    window.pageCache.pages = newPages;
    window.pageCache.cachedWeek = actualWeek;
  }

  if (!forceFetch && window.pageCache.pages[pageNumber]) {
    return window.pageCache.pages[pageNumber];
  }

  const { from, to } = getWeekDays(pageNumber);
  const body = new URLSearchParams({
    action: "getEntriesBetweenDates",
    userUuid,
    from,
    to,
  });

  const response = await fetch(GOOGLE_SCRIPT_URL, { method: "POST", body });
  const { entries } = await response.json();

  window.pageCache.pages[pageNumber] = entries;

  return entries;
}