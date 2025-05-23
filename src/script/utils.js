/**
 * @param {number} weekOffset
 * @param {boolean} toTodayOnly
 * @returns {{ from: string, to: string }}
 */
export function getWeekDaysByOffset(weekOffset = 0, toTodayOnly = false) {
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + 1 - weekOffset * 7);

  let sunday;

  if (weekOffset === 0 && toTodayOnly) {
    sunday = new Date(today);
  } else {
    sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
  }

  return {
    from: formatDateToISO8601(monday),
    to: formatDateToISO8601(sunday),
  };
}

/**
 * @param {Date} [date]
 * @returns {number}
 */
export function getWeekNumberByDate(date = new Date()) {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = day.getUTCDay() || 7;

  day.setUTCDate(day.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((day.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return weekNum;
}

/**
 * @param {Date} [date]
 * @returns {{ year: number, week: number }}
 */
export function getYearAndWeekByDate(date = new Date()) {
  const year = date.getFullYear();
  const week = getWeekNumberByDate(date);

  return { year, week };
}

/**
 * @param {number} year
 * @param {number} week
 * @returns {{from: string, to: string}}
 */
export function getWeekRangeFromYearAndWeek(year, week) {
  const referenceDate = new Date(year, 0, 1 + (week - 1) * 7);
  const dayOfWeek = referenceDate.getDay();
  const ISOWeekStart = new Date(referenceDate);

  if (dayOfWeek <= 4) {
    ISOWeekStart.setDate(referenceDate.getDate() - referenceDate.getDay() + 1);
  } else {
    ISOWeekStart.setDate(referenceDate.getDate() + 8 - referenceDate.getDay());
  }

  const ISOweekEnd = new Date(ISOWeekStart);
  ISOweekEnd.setDate(ISOWeekStart.getDate() + 6);

  return {
    from: formatDateToISO8601(ISOWeekStart),
    to: formatDateToISO8601(ISOweekEnd),
  };
}

/**
 * @param {number} year
 * @returns {number}
 */
export function getWeeksNumberByYear(year) {
  /**
   * @param {Date} date
   * @returns {number}
   */
  function getWeekYear(date) {
    date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));

    return date.getUTCFullYear();
  }

  let date = new Date(Date.UTC(year, 11, 31));

  while (getWeekYear(date) !== year) {
    date.setUTCDate(date.getUTCDate() - 1);
  }

  return getWeekNumberByDate(date);
}

/**
 * @param {Date} date
 * @returns {string}
 */
export function formatDateToISO8601(date) {
  return (
    date.getFullYear() +
    '-' +
    String(date.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(date.getDate()).padStart(2, '0')
  );
}

/**
 * @param {Date} date
 * @returns {string}
 */
export function formatDateToString(date) {
  /** @type {Intl.DateTimeFormatOptions} */
  const localeDateStringOptions = { year: 'numeric', month: 'short', day: '2-digit' };

  return date.toLocaleDateString('en-US', localeDateStringOptions);
}

/**
 * @param {string} targetPath
 * @param {string[]} routePatterns
 * @returns {boolean}
 */
export function isPathInRouteList(targetPath, routePatterns) {
  const currentUrl = new URL(targetPath, window.location.origin);
  const normalizedCurrentPath = currentUrl.pathname;

  return routePatterns.some((baseRoute) => {
    if (baseRoute.includes('*')) {
      const regexPattern = baseRoute.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);

      return regex.test(normalizedCurrentPath);
    }

    return normalizedCurrentPath === baseRoute || normalizedCurrentPath.startsWith(`${baseRoute}/`);
  });
}
/**
 * @param {string} str
 * @param {string} char
 * @returns {string[]}
 */
export function splitByLastOccurrence(str, char) {
  const lastIndex = str.lastIndexOf(char);

  if (lastIndex === -1) {
    return [str, ''];
  }

  return [str.substring(0, lastIndex), str.substring(lastIndex + 1)];
}
