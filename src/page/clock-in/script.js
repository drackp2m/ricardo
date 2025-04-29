import { mainReady } from '../../script.js';
import { url } from '../../script/config.js';
import { GoogleSheets } from '../../script/google-sheets/main.js';
import { getWeekNumberByDate } from '../../script/utils.js';
import { WorkHistoryCache } from '../../script/work-history-cache.js';

mainReady.then(() => {
  const userUuid = localStorage.getItem('userUuid');

  const googleSheets = new GoogleSheets();

  const currentWeek = getWeekNumberByDate(new Date(date));
  const currentYear = new Date(date).getFullYear();

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;

  const GOOGLE_SCRIPT_URL = url.googleSheets;

  document.getElementById('registerEntry').onsubmit = function (e) {
    e.preventDefault();

    const date = document.getElementById('date').value.trim();
    const entryTime = document.getElementById('entryTime').value.trim();
    const exitTime = document.getElementById('exitTime').value.trim();

    document.getElementById('message').innerHTML = ' ';

    const form = document.getElementById('registerEntry');

    Array.from(form.elements).forEach((el) => (el.disabled = true));
    document.getElementById('registerEntrySubmit').classList.add('loading');

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

          document.getElementById('registerEntrySubmit').classList.remove('loading');
          document.getElementById('registerEntry').reset();

          document.getElementById('message').classList.replace('warning', 'success');
          document.getElementById('message').textContent = 'Entry registered successfully!';
          setTimeout(() => {
            document.getElementById('message').textContent = ' ';
          }, 3000);
          Array.from(form.elements).forEach((el) => (el.disabled = false));
        } else if (response.error === 'entryAlreadyExists') {
          showError(response.error || 'Unknown error', form);
        } else {
          showError(response.error || 'Unknown error', form);
        }
      })
      .catch(() => {
        showError('Connection error', form);
      });
  };

  function showError(message, form) {
    const errorElement = document.getElementById('message');
    errorElement.textContent = message;

    Array.from(form.elements).forEach((el) => (el.disabled = false));
    document.getElementById('registerEntrySubmit').classList.remove('loading');
  }
});
