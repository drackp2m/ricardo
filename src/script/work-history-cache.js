/**
 * @typedef {import('../definition/google-sheets/get-entries-between-dates.response.mjs').GetEntriesBetweenDatesResponse} PageData
 * @typedef {{ cachedAt: Date, data: PageData[] }} WorkHistoryCacheData
 */

class WorkHistoryCache {
  #CACHE_KEY = 'workHistoryCache';

  /**
   * @param {number} year
   * @param {number} week
   * @param {PageData[]} data
   */
  set(year, week, data) {
    const all = this.getAll();
    const key = `${year}-${week}`;

    all[key] = { cachedAt: new Date(), data };

    localStorage.setItem(this.#CACHE_KEY, JSON.stringify(all));
  }

  /**
   * @param {number} year
   * @param {number} week
   * @returns {WorkHistoryCacheData|null}
   */
  get(year, week) {
    const all = this.getAll();
    const key = `${year}-${week}`;

    return all[key] || null;
  }

  /**
   * @returns {Object<string, WorkHistoryCacheData>}
   */
  getAll() {
    const raw = localStorage.getItem(this.#CACHE_KEY);

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
   * @returns {void}
   */
  delete(year, week) {
    const all = this.getAll();
    const key = `${year}-${week}`;

    if (all[key]) {
      delete all[key];

      localStorage.setItem(this.#CACHE_KEY, JSON.stringify(all));
    }
  }

  /**
   * @returns {void}
   */
  clear() {
    localStorage.removeItem(this.#CACHE_KEY);
  }
}

export const workHistoryCache = new WorkHistoryCache();
