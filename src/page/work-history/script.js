import { mainReady } from '../../script.js';
import { getWeeksNumberByYear, getCurrentYearAndWeek } from '../../script/utils.js';
import { setInfoToHtml } from './script/utils.js';
import { ChartManager } from './script/chart-manager.js';
import { GoogleSheets } from '../../script/google-sheets/main.js';

mainReady.then(async () => {
  let currentMode = 'range';
  const ctx = document.getElementById('myChart').getContext('2d');

  let { year: currentYear, week: currentWeek } = getCurrentYearAndWeek();

  const googleSheets = new GoogleSheets();

  const entries = await googleSheets.getWorkHistory(currentYear, currentWeek);

  setInfoToHtml(currentYear, currentWeek);

  const chartManager = new ChartManager(ctx, entries, currentMode);

  document.getElementById('showWorkedHours').addEventListener('change', (e) => {
    currentMode = e.target.checked ? 'total' : 'range';
    chartManager.setMode(currentMode);
  });

  document.getElementById('previous-week').addEventListener('click', async () => {
    updateChartAndHtmlInfo(false);
  });

  document.getElementById('next-week').addEventListener('click', async () => {
    updateChartAndHtmlInfo(true);
  });

  async function updateChartAndHtmlInfo(nextWeek) {
    const weeksNumberInCurrentYear = getWeeksNumberByYear(currentYear);
    const weekLimit = nextWeek ? weeksNumberInCurrentYear : 1;
    const weekLimitOverflowNewValue = nextWeek ? 1 : weeksNumberInCurrentYear;
    const modification = nextWeek ? 1 : -1;

    if (currentWeek === weekLimit) {
      currentYear += modification;
      currentWeek = weekLimitOverflowNewValue;
    } else {
      currentWeek += modification;
    }

    const entries = await googleSheets.getWorkHistory(currentYear, currentWeek, true);

    setInfoToHtml(currentYear, currentWeek);

    chartManager.updateData(entries);
  }
});
