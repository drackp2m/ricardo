import { setInfoToHtml } from './script/utils.js';
import { ChartManager } from './script/chart-manager.js';

import { mainReady } from '../../script.js';
import { getWeeksNumberByYear, getYearAndWeekByDate } from '../../script/utils.js';
import { googleSheets } from '../../script/google-sheets/main.js';
import { FormManager } from '../../script/form-manager.js';

mainReady.then(async () => {
  const formManager = new FormManager('work-history-form');
  formManager.disable();

  const showWorkedHoursInput =
    /** @type {HTMLInputElement} */
    (document.getElementById('show-worked-hours-input'));

  /** @type {'range'|'total'} */
  let currentMode = 'range';
  const ctx = /** @type {HTMLCanvasElement} */ (document.getElementById('chart')).getContext('2d');

  let { year: currentYear, week: currentWeek } = getYearAndWeekByDate();

  const entries = await googleSheets.getWorkHistory(currentYear, currentWeek);

  setInfoToHtml(currentYear, currentWeek);

  const chartManager = new ChartManager(ctx, entries.data, currentMode);

  formManager.enable();

  showWorkedHoursInput.addEventListener('change', (event) => {
    const input = /** @type {HTMLInputElement} */ (event.target);
    currentMode = input.checked ? 'total' : 'range';
    chartManager.setMode(currentMode);
  });

  document.getElementById('previous-week').addEventListener('click', async () => {
    formManager.disable('previous-week');

    updateChartAndHtmlInfo(false);
  });

  document.getElementById('next-week').addEventListener('click', async () => {
    formManager.disable('next-week');

    updateChartAndHtmlInfo(true);
  });

  /**
   * @param {boolean} nextWeek
   */
  async function updateChartAndHtmlInfo(nextWeek) {
    const weeksNumberInCurrentYear = getWeeksNumberByYear(currentYear);
    const weekLimit = nextWeek === true ? weeksNumberInCurrentYear : 1;
    const weekLimitOverflowNewValue = nextWeek === true ? 1 : weeksNumberInCurrentYear;
    const modification = nextWeek === true ? 1 : -1;

    if (currentWeek === weekLimit) {
      currentYear += modification;
      currentWeek = weekLimitOverflowNewValue;
    } else {
      currentWeek += modification;
    }

    const entries = await googleSheets.getWorkHistory(currentYear, currentWeek, true);

    setInfoToHtml(currentYear, currentWeek);

    chartManager.updateData(entries.data);

    formManager.enable();
  }
});
