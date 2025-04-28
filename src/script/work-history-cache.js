/**
 * @typedef {import('../script/google-sheets/main.js').PageData} PageData
 * @typedef {{ cachedAt: Date, data: PageData[] }} WorkHistoryCache
 */

export class WorkHistoryCache {
  static CACHE_KEY = 'workHistoryCache';

  /**
   * @param {number} year
   * @param {number} week
   * @param {PageData} data
   */
  static set(year, week, data) {
    const all = WorkHistoryCache.getAll();
    const key = `${year}-${week}`;

    all[key] = { cachedAt: new Date(), data };

    localStorage.setItem(WorkHistoryCache.CACHE_KEY, JSON.stringify(all));
  }

  /**
   * @param {number} year
   * @param {number} week
   * @returns {WorkHistoryCache|null}
   */
  static get(year, week) {
    const all = WorkHistoryCache.getAll();

    const key = `${year}-${week}`;

    return all[key] || null;
  }

  /**
   * @returns {Object<string, WorkHistoryCache>}
   */
  static getAll() {
    const raw = localStorage.getItem(WorkHistoryCache.CACHE_KEY);

    if (raw === null) {
      return {};
    }

    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  /**
   * @param {number} year
   * @param {number} week
   * @returns {boolean}
   */
  static delete(year, week) {
    const all = WorkHistoryCache.getAll();
    const key = `${year}-${week}`;

    if (all[key]) {
      delete all[key];

      localStorage.setItem(WorkHistoryCache.CACHE_KEY, JSON.stringify(all));
    }
  }

  static clear() {
    localStorage.removeItem(WorkHistoryCache.CACHE_KEY);
  }
}
