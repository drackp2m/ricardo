import { GoogleSheets } from './script/google-sheets/main.js';
import { url } from './script/config.js';

(function () {
  executeFirstRedirectIfNeeded();

  document.addEventListener('DOMContentLoaded', async function () {
    const isLocationBasePathname = this.location.pathname === url.basePathname;
    const initialSessionActiveChecked = sessionStorage.getItem('initialSessionActive') !== null;

    // ToDo => check this when implements logout feature

    if (isLocationBasePathname || initialSessionActiveChecked === false) {
      sessionStorage.setItem('initialSessionActive', 'true');

      document.getElementById('check-local').classList.add('loading');

      const localStorageUserUuid = localStorage.getItem('userUuid');

      const missingLocalStorageUserUuid = localStorageUserUuid === null;
      const isLocationPageLogin = location.pathname !== `${url.basePathname}page/login`;

      if (missingLocalStorageUserUuid && isLocationPageLogin) {
        window.location.href = `${url.basePathname}page/login`;
        return;
      }

      document.getElementById('check-remote').classList.add('loading');

      const googleSheets = new GoogleSheets();

      try {
        const user = await googleSheets.login(localStorageUserUuid);

        localStorage.setItem('userName', user.name);
        localStorage.setItem('userSurname', user.surname);

        window.location.href = `${url.basePathname}page/form`;
      } catch (error) {
        window.location.href = `${url.basePathname}page/login`;
      }
    }
  });

  function executeFirstRedirectIfNeeded() {
    const initialRedirectCompleted = sessionStorage.getItem('initialRedirect') !== null;

    if (initialRedirectCompleted === false) {
      sessionStorage.setItem('initialRedirect', 'true');

      if (location.pathname !== url.basePathname) {
        window.location.href = url.basePathname;
      }
    }
  }
})();
