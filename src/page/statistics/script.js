import { mainReady } from '../../script.js';
import { fetchPage } from './utils.js';
import { getWeekNumber } from '../../script/utils.js';
import { ChartManager } from './chart-manager.js';

mainReady.then(async () => {
  let currentMode = 'range';
  const ctx = document.getElementById('myChart').getContext('2d');

  const currentWeek = getWeekNumber(new Date());
  const currentYear = new Date().getFullYear();
  let entries = await fetchPage(currentYear, currentWeek, true);

  const chartManager = new ChartManager(ctx, entries, currentMode);

  document.getElementById('showWorkedHours').addEventListener('change', (e) => {
    currentMode = e.target.checked ? 'total' : 'range';
    chartManager.setMode(currentMode);
  });
});
