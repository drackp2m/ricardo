import { GoogleSheets } from './script/google-sheets/main.js';
import { url } from './script/config.js';
import { getWeekRangeFromYearAndWeek } from './script/utils.js';

export const mainReady = (async function () {
  executeFirstRedirectIfNeeded();

  await new Promise((resolve) => {
    document.addEventListener('DOMContentLoaded', async function () {
      const isSessionActive = localStorage.getItem('userUuid') !== null;
      const isLocationBasePathname = this.location.pathname === url.basePathname;
      const initialSessionActiveChecked = sessionStorage.getItem('initialSessionActive') !== null;

      // ToDo => check this when implements logout feature

      if (isLocationBasePathname === false) {
        resolve();

        return;
      }

      if (initialSessionActiveChecked === true) {
        const destinationUrl = isSessionActive
          ? `${url.basePathname}page/clock-in`
          : `${url.basePathname}page/login`;

        window.location.href = destinationUrl;

        resolve();

        return;
      }

      document.getElementById('check-local').classList.replace('invisible', 'spinner-line');

      sessionStorage.setItem('initialSessionActive', 'true');

      const localStorageUserUuid = localStorage.getItem('userUuid');

      const hasLocalStorageUserUuid = localStorageUserUuid !== null;
      const isLocationPageLogin = location.pathname === `${url.basePathname}page/login`;

      if (hasLocalStorageUserUuid === false && isLocationPageLogin === false) {
        window.location.href = `${url.basePathname}page/login`;

        resolve();

        return;
      }

      document.getElementById('check-local').classList.replace('spinner-line', 'check');
      document.getElementById('check-remote').classList.replace('invisible', 'spinner-line');

      const googleSheets = new GoogleSheets();

      try {
        const user = await googleSheets.login(localStorageUserUuid);

        localStorage.setItem('userName', user.name);
        localStorage.setItem('userSurname', user.surname);

        document.getElementById('check-remote').classList.replace('spinner-line', 'check');
        document.getElementById('get-data').classList.replace('invisible', 'spinner-line');

        const { year, week } = getWeekRangeFromYearAndWeek();

        try {
          await googleSheets.getWorkHistory(year, week, false);
        } catch (error) {
          localStorage.removeItem('userUuid');
          localStorage.removeItem('userName');
          localStorage.removeItem('userSurname');

          window.location.href = `${url.basePathname}page/login`;
        }

        const initialRedirectFrom = sessionStorage.getItem('initialRedirectFrom');

        window.location.href = initialRedirectFrom ?? `${url.basePathname}page/clock-in`;
      } catch (error) {
        window.location.href = `${url.basePathname}page/login`;
      }

      resolve();

      return;
    });
  });

  function executeFirstRedirectIfNeeded() {
    const initialRedirectCompleted = sessionStorage.getItem('initialRedirectFrom') !== null;

    if (initialRedirectCompleted === false) {
      sessionStorage.setItem('initialRedirectFrom', location.pathname);

      if (location.pathname !== url.basePathname) {
        window.location.href = url.basePathname;
      }
    }
  }
})();
