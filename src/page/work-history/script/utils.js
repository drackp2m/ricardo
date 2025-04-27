import { getWeekRangeFromYearAndWeek } from '../../../script/utils.js';

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

  const localeDateStringOptions = { year: 'numeric', month: 'short', day: '2-digit' };

  from.innerHTML = new Date(weekDays.from).toLocaleDateString('en-US', localeDateStringOptions);
  to.innerHTML = new Date(weekDays.to).toLocaleDateString('en-US', localeDateStringOptions);

  weekInfo.classList.remove('hidden');

  weekNumber.innerHTML = `Week ${week} of ${year}`;
}
