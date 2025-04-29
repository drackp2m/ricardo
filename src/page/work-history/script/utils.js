import { formatDateToString, getWeekRangeFromYearAndWeek } from '../../../script/utils.js';

/**
 * @param {number} year
 * @param {number} week
 * @returns {void}
 */
export function setInfoToHtml(year, week) {
  const weekDays = getWeekRangeFromYearAndWeek(year, week);

  const weekInfo = document.getElementById('week-info');
  const weekNumber = document.getElementById('week-number');
  const from = document.getElementById('from');
  const to = document.getElementById('to');

  from.innerHTML = formatDateToString(new Date(weekDays.from));
  to.innerHTML = formatDateToString(new Date(weekDays.to));

  weekInfo.classList.remove('hidden');

  weekNumber.innerHTML = `Week ${week} of ${year}`;
}
