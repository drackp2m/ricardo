import { googleSheets } from './google-sheets/main.js';
import { Logger } from './logger.js';

/**
 * @typedef {import('../definition/google-sheets/get-user-data.response.mjs').GetUserDataResponse} UserData
 */

class SessionManager {
  #USER_DATA_KEY = 'userData';
  #INITIAL_CHECK_KEY = 'initialCheck';
  #REDIRECT_URL = 'redirectUrl';
  /** @type {Promise<UserData|null|undefined>|null} */
  #loadUserDataPromise = null;

  /**
   * @returns {boolean}
   */
  isInitialCheckCompleted() {
    return sessionStorage.getItem(this.#INITIAL_CHECK_KEY) !== null;
  }

  /**
   * @returns {void}
   */
  setInitialCheckCompleted() {
    sessionStorage.setItem(this.#INITIAL_CHECK_KEY, 'true');
  }

  /**
   * @param {string} url
   * @returns {void}
   */
  setRedirectUrl(url) {
    sessionStorage.setItem(this.#REDIRECT_URL, url);
  }

  /**
   * 
   */
  clearRedirectUrl() {
    sessionStorage.removeItem(this.#REDIRECT_URL);
  }

  /**
   * @returns {string|null}
   */
  getRedirectUrl() {
    return sessionStorage.getItem(this.#REDIRECT_URL);
  }

  /**
   * @returns {boolean}
   */
  isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
  }

  /**
   * @returns {string|null}
   */
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * @returns {string|null}
   */
  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  /**
   * @returns {Promise<UserData|null>}
   */
  async getUserData() {
    const userFromSessionStorage = this.#getUserDataFromSessionStorage();

    if (userFromSessionStorage !== null) {
      return userFromSessionStorage;
    }

    if (this.isLoggedIn() === false) {
      return null;
    }

    if (this.#loadUserDataPromise !== null) {
      return this.#loadUserDataPromise;
    }

    this.#loadUserDataPromise = this.#fetchUserData().finally(() => {
      this.#loadUserDataPromise = null;
    });

    return this.#loadUserDataPromise;
  }

  /**
   * @returns {Promise<UserData|null>}
   */
  refreshUserData() {
    this.#setUserDataToSessionStorage(null);

    return this.getUserData();
  }

  /**
   * @param {...string} roles
   * @returns {Promise<boolean>}
   */
  async hasRole(...roles) {
    const userData = await this.getUserData();

    if (userData === null || roles.length === 0) {
      return false;
    }

    return roles.includes(userData.rol);
  }

  /**
   * @param {...string} statuses
   * @returns {Promise<boolean>}
   */
  async hasStatus(...statuses) {
    const userData = await this.getUserData();

    if (userData === null || statuses.length === 0) {
      return false;
    }

    return statuses.includes(userData.status);
  }

  /**
   * @param {string} authToken
   * @param {string} refreshToken
   */
  setSession(authToken, refreshToken) {
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('refreshToken', refreshToken);

    this.#setUserDataToSessionStorage(null);

    Logger.debug('Session tokens set');
  }

  /**
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');

    this.#setUserDataToSessionStorage(null);
    this.#clearInitialCheck();

    Logger.debug('Session ended');
  }

  /**
   * @returns {Promise<UserData|null>}
   */
  #getUserDataFromSessionStorage() {
    const userData = sessionStorage.getItem(this.#USER_DATA_KEY);

    if (userData === null) {
      return null;
    }

    try {
      return JSON.parse(userData);
    } catch (error) {
      Logger.error('Failed to parse user data from session storage', error);

      return null;
    }
  }

  /**
   * @returns {void}
   */
  #clearInitialCheck() {
    sessionStorage.removeItem(this.#INITIAL_CHECK_KEY);
  }

  /**
   * @param {UserData} userData
   * @returns {void}
   */
  #setUserDataToSessionStorage(userData) {
    if (userData === null) {
      sessionStorage.removeItem(this.#USER_DATA_KEY);
    } else {
      sessionStorage.setItem(this.#USER_DATA_KEY, JSON.stringify(userData));
    }
  }

  /**
   * @returns {Promise<UserData|null>}
   */
  async #fetchUserData() {
    try {
      const response = await googleSheets.getUserData();

      if (response.success === false) {
        Logger.warning('Failed to get user data', response.error);

        return null;
      }

      this.#setUserDataToSessionStorage(response.data ?? null);

      return response.data;
    } catch (error) {
      Logger.error('Error fetching user data', error);

      return null;
    }
  }
}

export const sessionManager = new SessionManager();
