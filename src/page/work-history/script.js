import { mainReady } from '../../script.js';
import { getWeekNumberByDate, getWeeksNumberByYear } from '../../script/utils.js';
import { fetchPage, setInfoToHtml } from './script/utils.js';
import { ChartManager } from './script/chart-manager.js';

mainReady.then(async () => {
  let currentMode = 'range';
  const ctx = document.getElementById('myChart').getContext('2d');

  let currentWeek = getWeekNumberByDate(new Date());
  let currentYear = new Date().getFullYear();

  const entries = await fetchPage(currentYear, currentWeek);

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

    const entries = await fetchPage(currentYear, currentWeek);

    setInfoToHtml(currentYear, currentWeek);

    chartManager.updateData(entries);
  }
});
