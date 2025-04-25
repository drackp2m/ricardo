export class WorkHistoryCache {
  static CACHE_KEY = 'workHistoryCache';

  static getAll() {
    const raw = localStorage.getItem(WorkHistoryCache.CACHE_KEY);
    
    if (!raw) {
      return {};
    }

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
