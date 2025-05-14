import { googleSheets } from './script/google-sheets/main.js';
import { url } from './script/config.js';
import { getYearAndWeekByDate, isPathInRouteList } from './script/utils.js';

export const mainReady = (async function () {
  if (handleInitialRedirection() === true) {
    return;
  }

  await waitForDOMContent();
})();

/**
 * @returns {boolean}
 */
function handleInitialRedirection() {
  const initialRedirectCompleted = sessionStorage.getItem('initialRedirectFrom') !== null;

  if (initialRedirectCompleted === true) {
    return false;
  }

  sessionStorage.setItem('initialRedirectFrom', location.pathname);

  if (location.pathname === url.basePathname) {
    return false;
  }

  window.location.href = url.basePathname;

  return true;
}

/**
 * @returns {Promise<void>}
 */
function waitForDOMContent() {
  return new Promise((resolve) => {
    document.addEventListener('DOMContentLoaded', async function () {
      await checkProtectedRoutes();
      
      handleInitialAuthVerification().then(() => {
        resolve();
      });
    });
  });
}

/**
 * @returns {Promise<void>}
 */
async function handleInitialAuthVerification() {
  if (location.pathname !== url.basePathname) {
    return;
  }

  const isInitialSessionActiveChecked =
    sessionStorage.getItem('initialSessionActiveChecked') !== null;
  const authToken = localStorage.getItem('authToken');
  const isAuthTokenPresent = authToken !== null;

  if (isInitialSessionActiveChecked === true) {
    redirectBasedOnAuthToken(isAuthTokenPresent);

    return;
  }

  sessionStorage.setItem('initialSessionActiveChecked', 'true');

  updateUIStatus('checking-local');

  if (isAuthTokenPresent === false) {
    redirectTo('page/login');

    return;
  }

  updateUIStatus('checking-remote');
  const userData = await googleSheets.getUserData();

  if (userData.success === false) {
    redirectTo('page/login');

    return;
  }

  updateUIStatus('loading-data');

  const { year, week } = getYearAndWeekByDate();

  await googleSheets.getWorkHistory(year, week, false);

  const initialRedirectFrom = sessionStorage.getItem('initialRedirectFrom');

  redirectTo(initialRedirectFrom ?? 'page/clock-in');
}

/**
 * @param {string} status
 * @returns {void}
 */
function updateUIStatus(status) {
  switch (status) {
    case 'checking-local':
      document.getElementById('check-local')?.classList.replace('invisible', 'spinner-line');
      break;
    case 'checking-remote':
      document.getElementById('check-local')?.classList.replace('spinner-line', 'check');
      document.getElementById('check-remote')?.classList.replace('invisible', 'spinner-line');
      break;
    case 'loading-data':
      document.getElementById('check-remote')?.classList.replace('spinner-line', 'check');
      document.getElementById('get-data')?.classList.replace('invisible', 'spinner-line');
      break;
  }
}

/**
 * @param {boolean} isAuthTokenPresent
 * @returns {void}
 */
function redirectBasedOnAuthToken(isAuthTokenPresent) {
  const destination = isAuthTokenPresent ? 'page/clock-in' : 'page/login';

  redirectTo(destination);
}

/**
 * @param {string} path
 * @returns {void}
 */
function redirectTo(path) {
  if (!path.startsWith(url.basePathname) && !path.startsWith('http')) {
    path = `${url.basePathname}${path}`;
  }

  window.location.href = path;
}

/**
 * @returns {Promise<void>}
 */
function checkProtectedRoutes() {
  const publicRoutes = ['/page/login', '/page/register*', '/page/reset-password'];
  const authToken = localStorage.getItem('authToken');
  const isAuthTokenPresent = authToken !== null;
  const isOnBasePath = location.pathname === url.basePathname;

  if (isOnBasePath === false && isAuthTokenPresent === true) {
    if (isPathInRouteList(location.pathname, publicRoutes) === true) {
      redirectTo('page/clock-in');

      return Promise.resolve();
    }
  }

  return Promise.resolve();
}
