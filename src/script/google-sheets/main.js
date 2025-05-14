import { httpClient } from '../http-client.js';

import { getWorkHistory } from './get-work-history.js';

/**
 * @template T
 * @typedef {import('../../definition/google-sheets/google-sheets.response.mjs').GoogleSheetsResponse<T>} GoogleSheetsResponse<T>
 */

/**
 * @typedef {import('../../definition/google-sheets/auth-tokens-response.mjs').AuthTokensResponse} AuthTokensResponse
 */

class GoogleSheets {
  /** @type {Map<string, Promise<any>>} */
  #ongoingRequests = new Map();

  /**
   *
   * @param {string} name
   * @param {string} surname
   * @param {string} email
   * @param {string} referer
   */
  register(name, surname, email, referer) {
    return httpClient.request({
      action: 'register',
      name,
      surname,
      email,
      referer,
    });
  }

  /**
   *
   * @param {string} email
   * @param {string} code
   * @param {string} password
   * @returns {Promise<GoogleSheetsResponse<AuthTokensResponse>>}
   */
  registerPassword(email, code, password) {
    return httpClient.request({
      action: 'registerPassword',
      email,
      code,
      password,
    });
  }

  /**
   * @param {string} clientId
   * @param {string} credential
   * @returns {Promise<GoogleSheetsResponse<AuthTokensResponse>>}
   */
  loginWithGoogle(clientId, credential) {
    return httpClient.request({
      action: 'loginWithGoogle',
      clientId,
      credential,
    });
  }

  /**
   * @param {string} email
   * @param {string} password
   * @returns {Promise<GoogleSheetsResponse<AuthTokensResponse>>}
   */
  async login(email, password) {
    return httpClient.request({ action: 'login', email, password });
  }

  /**
   * @typedef {import('../../definition/google-sheets/get-user-data.response.mjs').GetUserDataResponse} GetUserDataResponse
   *
   * @returns {Promise<GoogleSheetsResponse<GetUserDataResponse>>}
   */
  getUserData() {
    return httpClient.request({ action: 'getUserData' });
  }

  /**
   * @param {string} date
   * @param {string} entryTime
   * @param {string} exitTime
   * @returns {Promise<GoogleSheetsResponse<void>>}
   */
  registerEntry(date, entryTime, exitTime) {
    return httpClient.request({ action: 'registerEntry', date, entryTime, exitTime });
  }

  /**
   * @typedef {import('../../definition/google-sheets/get-entries-between-dates.response.mjs').GetEntriesBetweenDatesResponse} GetEntriesBetweenDatesResponse
   *
   * @param {number} year
   * @param {number} week
   * @param {boolean} [useCache]
   * @returns {Promise<GoogleSheetsResponse<GetEntriesBetweenDatesResponse[]>>}
   */
  getWorkHistory(year, week, useCache = true) {
    return getWorkHistory(year, week, useCache);
  }

  /**
   * @template T
   * @param {string} requestKey
   * @param {() => Promise<T>} promiseFn
   * @returns {Promise<T>}
   */
  #deduplicateRequest(requestKey, promiseFn) {
    if (this.#ongoingRequests.has(requestKey) === true) {
      return this.#ongoingRequests.get(requestKey);
    }

    const requestPromise = promiseFn();

    this.#ongoingRequests.set(requestKey, requestPromise);

    requestPromise.finally(() => {
      this.#ongoingRequests.delete(requestKey);
    });

    return requestPromise;
  }
}

export const googleSheets = new GoogleSheets();