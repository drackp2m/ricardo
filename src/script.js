import { googleSheets } from './script/google-sheets/main.js';
import { url } from './script/config.js';
import { getYearAndWeekByDate, navigateTo } from './script/utils.js';
import { sessionManager } from './script/session-manager.js';
import { redirectByUserStatus } from './script/user-status-redirection.js';
import { Logger } from './script/logger.js';
import { headerComponent } from './component/header/header.component.js';

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

    if (isInitialCheckCompleted === false) {
      await this.#waitForDOMContent();

      await this.#checkUserSession();

      await redirectByUserStatus();

      sessionManager.setInitialCheckCompleted();

      return;
    }

    const hasStatusRedirection = await redirectByUserStatus();

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

    navigateTo(url.basePathname)

    return true;
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
    Logger.debug('Checking user session...');

    this.#updateUIStatus('checking-local');

    const isLoggedIn = sessionManager.isLoggedIn();

    if (isLoggedIn === false) {
      navigateTo(`/page/login`);

      return;
    }

    this.#updateUIStatus('checking-remote');
    const userData = await sessionManager.getUserData();

    if (userData === null) {
      navigateTo(`/page/login`);

      return;
    }

    const hasActiveStatus = await sessionManager.hasStatus('ACTIVE');

    if (hasActiveStatus === false) {
      sessionManager.clearRedirectUrl();
      navigateTo('/page/status');

      return;
    }

    this.#updateUIStatus('loading-data');
    const { year, week } = getYearAndWeekByDate();
    const redirectTo = sessionManager.getRedirectUrl();

    await googleSheets.getWorkHistory(year, week, false);

    navigateTo(redirectTo ?? '/page/clock-in');
  }

  /**
   * @param {UIStatus} status
   * @returns {void}
   */
  #updateUIStatus(status) {
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
}

export const main = new AppMain();

main.onReady(async () => {
  const header = await fetch('component/header/header.component.html');

  const body = document.querySelector('body');
  const headerElement = document.createElement('header');

  headerElement.innerHTML = await header.text();

  body.prepend(headerElement);

  headerComponent();
});
