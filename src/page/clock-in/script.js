import { mainReady } from '../../script.js';
import { FormManager } from '../../script/form-manager.js';
import { googleSheets } from '../../script/google-sheets/main.js';
import { formatDateToISO8601, getYearAndWeekByDate } from '../../script/utils.js';
import { WorkHistoryCache } from '../../script/work-history-cache.js';

mainReady.then(() => {
  const formManager = new FormManager('clock-in-form', 'feedback');

  const now = new Date();
  const { year: currentYear, week: currentWeek } = getYearAndWeekByDate(now);

  const checkingEntranceElement = document.getElementById('checking-entrance');
  const entryTimeElement = document.getElementById('entry-time');
  const notWorkElement = document.getElementById('not-work');
  const hasErrorElement = document.getElementById('has-error');
  const clockInFormElement =
    /** @type {HTMLFormElement|null} */
    (document.getElementById('clock-in-form'));
  const dateInputElement =
    /** @type {HTMLInputElement|null} */
    (document.getElementById('date-input'));
  const entryTimeInputElement =
    /** @type {HTMLInputElement|null} */
    (document.getElementById('entry-time-input'));
  const exitTimeInputElement =
    /** @type {HTMLInputElement|null} */
    (document.getElementById('exit-time-input'));

  setEntryTimeValue();

  dateInputElement.value = formatDateToISO8601(now);

  clockInFormElement.onsubmit = function (e) {
    e.preventDefault();

    const date = dateInputElement.value.trim();
    const entryTime = entryTimeInputElement.value.trim();
    const exitTime = exitTimeInputElement.value.trim();

    formManager.disable(clockInFormElement.id);

    googleSheets.registerEntry(date, entryTime, exitTime).then((response) => {
      if (response.success === false) {
        formManager.enable();
        formManager.setError(response.error || 'Unknown error');
      } else {
        const { year, week } = getYearAndWeekByDate(new Date(date));
        WorkHistoryCache.delete(currentYear, currentWeek);
        // ToDo => try to make googleSheets singleton and use it here
        // googleSheets.getWorkHistory(year, week).then(() => {
        //   console.log('Work history updated');
        // });

        formManager.reset();
        formManager.enable();
        formManager.setSuccess('Entry registered successfully');
      }
    });
  };

  function setEntryTimeValue() {
    checkingEntranceElement.classList.remove('hidden');

    googleSheets.getWorkHistory(currentYear, currentWeek, false).then((workHistory) => {
      checkingEntranceElement.classList.add('hidden');

      if (workHistory.success === false) {
        hasErrorElement.classList.remove('hidden');
        return;
      }

      const entryTimeValueElement = document.getElementById('entry-time-value');

      const entryTime = workHistory.data.find(
        (entry) => entry.date === formatDateToISO8601(now)
      )?.entryTime;

      if (entryTime === undefined || entryTime === null) {
        notWorkElement.classList.remove('hidden');
        return;
      }

      entryTimeValueElement.textContent = entryTime;
      entryTimeElement.classList.remove('hidden');
    });
  }
});
