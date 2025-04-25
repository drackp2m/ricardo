/**
 * @param {number} weekOffset 
 * @param {boolean} toTodayOnly 
 * @returns {{ from: string, to: string }}
 */
export function getWeekDays(weekOffset = 0, toTodayOnly = false) {
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
};

/**
 * @param {Date} date 
 * @returns {number}
 */
export function getWeekNumber(date) {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = day.getUTCDay() || 7;

  day.setUTCDate(day.getUTCDate() + 4 - dayNum);

  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((day - yearStart) / 86400000 + 1) / 7);

  return weekNum;
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
