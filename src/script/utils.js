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
 * @param {Date} date
 * @returns {number}
 */
export function getWeekNumberByDate(date) {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = day.getUTCDay() || 7;

  day.setUTCDate(day.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((day - yearStart) / 86400000 + 1) / 7);

  return weekNum;
}

/**
 * @returns {{ year: number, week: number }}
 */
export function getCurrentYearAndWeek() {
  const today = new Date();
  const year = today.getFullYear();
  const week = getWeekNumberByDate(today);

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
  const localeDateStringOptions = { year: 'numeric', month: 'short', day: '2-digit' };

  return date.toLocaleDateString('en-US', localeDateStringOptions);
}