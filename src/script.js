import { GoogleSheets } from './script/google-sheets/main.js';
import { url } from './script/config.js';
import { getYearAndWeekByDate } from './script/utils.js';

/**
 * @enum {string}
 */
const AuthStatus = {
  CHECKING_LOCAL: 'checking-local',
  CHECKING_REMOTE: 'checking-remote',
  LOADING_DATA: 'loading-data'
};

export const mainReady = (async function () {
  if (handleInitialRedirection()) {
    return;
  }

  await waitForDOMContent();
})();

/**
 * @returns {boolean}
 */
function handleInitialRedirection() {
  const initialRedirectCompleted = sessionStorage.getItem('initialRedirectFrom') !== null;

  if (initialRedirectCompleted) {
    return false;
  }

  const isLoginPage = location.pathname.includes('/login');
  const redirectTarget = isLoginPage ? 'page/clock-in' : location.pathname;
  sessionStorage.setItem('initialRedirectFrom', redirectTarget);

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
      try {
        await handleAuthentication();
      } finally {
        resolve();
      }
    });
  });
}

/**
 * @returns {Promise<void>}
 */
async function handleAuthentication() {
  if (location.pathname !== url.basePathname) {
    return;
  }

  const initialSessionActiveChecked = sessionStorage.getItem('initialSessionActive') !== null;
  const isSessionActive = localStorage.getItem('userUuid') !== null;

  if (initialSessionActiveChecked) {
    redirectBasedOnSession(isSessionActive);
    return;
  }

  sessionStorage.setItem('initialSessionActive', 'true');
  
  updateUIStatus(AuthStatus.CHECKING_LOCAL);
  
  const userUuid = localStorage.getItem('userUuid');
  if (!userUuid) {
    redirectTo('page/login');
    return;
  }

  updateUIStatus(AuthStatus.CHECKING_REMOTE);
  const googleSheets = new GoogleSheets();
  const loginResponse = await googleSheets.login(userUuid);

  if (!loginResponse.success) {
    clearUserSession();
    redirectTo('page/login');
    return;
  }

  saveUserData(loginResponse.data);
  
  updateUIStatus(AuthStatus.LOADING_DATA);
  const { year, week } = getYearAndWeekByDate();
  await googleSheets.getWorkHistory(year, week, false);

  const initialRedirectFrom = sessionStorage.getItem('initialRedirectFrom');
  redirectTo(initialRedirectFrom ?? 'page/clock-in');
}

/**
 * @param {AuthStatus} status
 */
function updateUIStatus(status) {
  switch (status) {
    case AuthStatus.CHECKING_LOCAL:
      document.getElementById('check-local')?.classList.replace('invisible', 'spinner-line');
      break;
    case AuthStatus.CHECKING_REMOTE:
      document.getElementById('check-local')?.classList.replace('spinner-line', 'check');
      document.getElementById('check-remote')?.classList.replace('invisible', 'spinner-line');
      break;
    case AuthStatus.LOADING_DATA:
      document.getElementById('check-remote')?.classList.replace('spinner-line', 'check');
      document.getElementById('get-data')?.classList.replace('invisible', 'spinner-line');
      break;
  }
}

/**
 * @param {boolean} isActive 
 */
function redirectBasedOnSession(isActive) {
  const destination = isActive ? 'page/clock-in' : 'page/login';
  redirectTo(destination);
}

/**
 * @param {string} path 
 */
function redirectTo(path) {
  if (!path.startsWith(url.basePathname) && !path.startsWith('http')) {
    path = `${url.basePathname}${path}`;
  }
  window.location.href = path;
}

/**
 * @param {Object} userData 
 */
function saveUserData(userData) {
  localStorage.setItem('userName', userData.name);
  localStorage.setItem('userSurname', userData.surname);
}

/**
 * @returns {void}
 */
function clearUserSession() {
  localStorage.removeItem('userUuid');
  localStorage.removeItem('userName');
  localStorage.removeItem('userSurname');
}