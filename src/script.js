import { googleSheets } from './script/google-sheets/main.js';
import { url } from './script/config.js';
import { getYearAndWeekByDate, isPathInRouteList } from './script/utils.js';
import { sessionManager } from './script/session-manager.js';
import { Logger } from './script/logger.js';

/**
 * @typedef {'checking-local'|'checking-remote'|'loading-data'} UIStatus
 * @typedef {() => void} ReadyCallback
 */

class AppMain {
  /** @type {Promise<void>|undefined} */
  #initializationPromise = null;

  /**
   * @param {ReadyCallback} callback
   * @returns {Promise<void>}
   */
  async onReady(callback) {
    if (this.#initializationPromise === null) {
      this.#initializationPromise = this.#initialize().finally(() => {
        this.#initializationPromise = null;
      });
    }

    await this.#initializationPromise;

    callback();
  }

  /**
   * @returns {Promise<void>}
   */
  async #initialize() {
    const hasInitialRedirection = this.#handleInitialRedirection();

    if (hasInitialRedirection === true) {
      return;
    }

    const isInitialCheckCompleted = sessionManager.isInitialCheckCompleted();

    Logger.debug('isInitialCheckCompleted', isInitialCheckCompleted);

    if (isInitialCheckCompleted === false) {
      sessionManager.setInitialCheckCompleted();

      await this.#waitForDOMContent();

      await this.#checkUserSession();

      await this.#checkUserStatusAndRedirect();

      return;
    }

    const hasStatusRedirection = await this.#checkUserStatusAndRedirect();

    Logger.debug('hasStatusRedirection', hasStatusRedirection);

    if (hasStatusRedirection === true) {
      return;
    }

    await this.#waitForDOMContent();
  }

  /**
   * @returns {boolean}
   */
  #handleInitialRedirection() {
    const isInitialCheckCompleted = sessionManager.isInitialCheckCompleted();
    const isOnBasePath = location.pathname === url.basePathname;

    if (isOnBasePath === true || isInitialCheckCompleted === true) {
      return false;
    }

    sessionManager.setRedirectUrl(location.pathname);

    window.location.href = url.basePathname;

    return true;
  }

  /**
   * @returns {Promise<boolean>}
   */
  async #checkUserStatusAndRedirect() {
    const isLoggedIn = sessionManager.isLoggedIn();

    console.log({ isLoggedIn });

    if (isLoggedIn === false) {
      return this.#redirectTo('/page/login');
    }

    const isActive = await sessionManager.hasStatus('ACTIVE');

    console.log({ isActive });

    if (isActive === false) {
      return this.#redirectTo('/page/status');
    }

    const publicRoutes = ['/page/login', '/page/register*'];

    if (isPathInRouteList(location.pathname, publicRoutes) === true) {
      return this.#redirectTo('/page/clock-in');
    }

    return false;
  }

  /**
   * @returns {Promise<void>}
   */
  #waitForDOMContent() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => resolve());
      } else {
        resolve();
      }
    });
  }

  /**
   * @returns {Promise<void>}
   */
  async #checkUserSession() {
    this.#updateUIStatus('checking-local');
    console.log('Checking local session...');

    const isLoggedIn = sessionManager.isLoggedIn();

    if (isLoggedIn === false) {
      this.#redirectTo(`/page/login`);

      return;
    }

    this.#updateUIStatus('checking-remote');
    const userData = await sessionManager.getUserData();

    if (userData === null) {
      this.#redirectTo(`/page/login`);

      return;
    }

    const hasActiveStatus = await sessionManager.hasStatus('ACTIVE');

    if (hasActiveStatus === false) {
      sessionManager.setRedirectUrl(null);
      this.#redirectTo('/page/status');

      return;
    }

    this.#updateUIStatus('loading-data');
    const { year, week } = getYearAndWeekByDate();
    const redirectTo = sessionManager.getRedirectUrl();

    await googleSheets.getWorkHistory(year, week, false);

    this.#redirectTo(redirectTo ?? '/page/clock-in');
  }

  /**
   * @param {UIStatus} status
   * @returns {void}
   */
  #updateUIStatus(status) {
    console.log('Updating UI status:', document.getElementById('check-local'));

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
   * @param {string} path
   * @returns {boolean}
   */
  #redirectTo(path) {
    const pathInLocationPathName = isPathInRouteList(location.pathname, [path]);

    if (pathInLocationPathName === true) {
      return false;
    }

    if (path.startsWith(url.basePathname) === false && path.startsWith('http') === false) {
      path = `${url.basePathname}${path}`;
    }

    window.location.href = path;

    return true;
  }
}

export const main = new AppMain();

main.onReady(() => {
  console.log('AppMain is ready');
});
