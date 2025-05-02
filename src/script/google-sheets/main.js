import { login } from './login.js';
import { getWorkHistory } from './get-work-history.js';
import { registerEntry } from './register-entry.js';

/**
 * @template T
 * @typedef {import('../../definition/google-sheets/google-sheets.response.mjs').GoogleSheetsResponse<T>} GoogleSheetsResponse<T>
 */

/**
 * @typedef {import('../../definition/google-sheets/login.response.mjs').LoginResponse} LoginResponse
 * @typedef {import('../../definition/google-sheets/get-entries-between-dates.response.mjs').GetEntriesBetweenDatesResponse} GetEntriesBetweenDatesResponse
 */

export class GoogleSheets {
  /** @type {Map<string, Promise<any>>} */
  ongoingRequests = new Map();
  userData = null;

  /**
   * @param {string} userUuid
   * @returns {Promise<GoogleSheetsResponse<LoginResponse>>}
   */
  async login(userUuid) {
    const requestKey = `login-${userUuid}`;

    const resultPromise = this.#deduplicateRequest(requestKey, () => login(userUuid));

    const that = this;

    resultPromise.then((response) => {
      if (response.success === false) {
        that.userData = null;
      } else {
        that.userData = response.data;
      }
    });

    return resultPromise;
  }

  /**
   * @param {string} date
   * @param {string} entryTime
   * @param {string} exitTime
   * @returns {Promise<GoogleSheetsResponse<undefined>>}
   */
  async registerEntry(date, entryTime, exitTime) {
    const requestKey = `registerEntry-${date}-${entryTime}-${exitTime}`;

    return this.#deduplicateRequest(requestKey, () => registerEntry(date, entryTime, exitTime));
  }

  /**
   * @param {number} year
   * @param {number} week
   * @param {boolean} [useCache]
   * @returns {Promise<GoogleSheetsResponse<GetEntriesBetweenDatesResponse[]>>}
   */
  async getWorkHistory(year, week, useCache = true) {
    const requestKey = `getWorkHistory-${year}-${week}-${useCache}`;

    return this.#deduplicateRequest(requestKey, () => getWorkHistory(year, week, useCache));
  }

  /**
   * @template T
   * @param {string} requestKey
   * @param {() => Promise<T>} promiseFn
   * @returns {Promise<T>}
   */
  #deduplicateRequest(requestKey, promiseFn) {
    if (this.ongoingRequests.has(requestKey) === true) {
      return this.ongoingRequests.get(requestKey);
    }

    const requestPromise = promiseFn();

    this.ongoingRequests.set(requestKey, requestPromise);

    requestPromise.finally(() => {
      this.ongoingRequests.delete(requestKey);
    });

    return requestPromise;
  }
}
