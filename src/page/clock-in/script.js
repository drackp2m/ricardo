import { mainReady } from '../../script.js';
import { url } from '../../script/config.js';
import { GoogleSheets } from '../../script/google-sheets/main.js';
import { getWeekNumberByDate } from '../../script/utils.js';
import { WorkHistoryCache } from '../../script/work-history-cache.js';

mainReady.then(() => {
  const userUuid = localStorage.getItem('userUuid');

  const googleSheets = new GoogleSheets();

  const now = new Date();

  const currentYear = now.getFullYear();
  const currentWeek = getWeekNumberByDate(now);

  const checkingEntranceElement = document.getElementById('checking-entrance');
  const entryTimeElement = document.getElementById('entry-time');
  const notWorkElement = document.getElementById('not-work');
  checkingEntranceElement.classList.remove('hidden');
  const clockInFormElement = /** @type {HTMLFormElement|null} */ (
    document.getElementById('clock-in-form')
  );
  const dateInputElement = /** @type {HTMLInputElement|null} */ (document.getElementById('date'));
  const entryTimeInputElement = /** @type {HTMLInputElement|null} */ (
    document.getElementById('entry-time-input')
  );
  const exitTimeInputElement = /** @type {HTMLInputElement|null} */ (
    document.getElementById('exit-time-input')
  );

  googleSheets.getWorkHistory(currentYear, currentWeek, false).then((workHistory) => {
    const entryTimeValueElement = document.getElementById('entry-time-value');

    const entryTime = workHistory.find(
      (entry) => entry.date === now.toISOString().split('T')[0]
    )?.entryTime;

    if (entryTime === undefined || entryTime === null) {
      checkingEntranceElement.classList.add('hidden');
      notWorkElement.classList.remove('hidden');
      return;
    }

    entryTimeValueElement.textContent = entryTime;
    checkingEntranceElement.classList.add('hidden');
    entryTimeElement.classList.remove('hidden');
  });

  const date = now.toISOString().split('T')[0];
  dateInputElement.value = date;

  const GOOGLE_SCRIPT_URL = url.googleSheets;

  clockInFormElement.onsubmit = function (e) {
    e.preventDefault();

    const date = dateInputElement.value.trim();
    const entryTime = entryTimeInputElement.value.trim();
    const exitTime = exitTimeInputElement.value.trim();

    document.getElementById('message').innerHTML = ' ';

    Array.from(clockInFormElement.elements).forEach(
      /** @param {HTMLInputElement} el */ (el) => (el.disabled = true)
    );
    document.getElementById('clock-in-submit').classList.add('loading');

    const body = new URLSearchParams({
      action: 'registerEntry',
      userUuid: userUuid,
      date,
      entryTime,
      exitTime,
    });

    fetch(`${GOOGLE_SCRIPT_URL}`, { method: 'POST', body })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          WorkHistoryCache.delete(currentYear, currentWeek);

          document.getElementById('clock-in-submit').classList.remove('loading');
          clockInFormElement.reset();

          document.getElementById('message').classList.replace('warning', 'success');
          document.getElementById('message').textContent = 'Entry registered successfully!';
          setTimeout(() => {
            document.getElementById('message').textContent = ' ';
          }, 3000);
          Array.from(clockInFormElement.elements).forEach(
            /** @param {HTMLInputElement} el */ (el) => (el.disabled = false)
          );
        } else if (response.error === 'entryAlreadyExists') {
          showError(response.error || 'Unknown error', clockInFormElement);
        } else {
          showError(response.error || 'Unknown error', clockInFormElement);
        }
      })
      .catch(() => {
        showError('Connection error', clockInFormElement);
      });
  };

  function showError(message, form) {
    const errorElement = document.getElementById('message');
    errorElement.textContent = message;

    Array.from(form.elements).forEach((el) => (el.disabled = false));
    document.getElementById('clock-in-submit').classList.remove('loading');
  }
});
