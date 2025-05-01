import { login } from './login.js';
import { getWorkHistory } from './get-work-history.js';

/**
 * @typedef {import('../../definition/google-sheets/login.response.mjs').LoginResponse} UserData
 * @typedef {import('../../definition/google-sheets/get-entries-between-dates.response.mjs').GetEntriesBetweenDatesResponse} GetEntriesBetweenDatesResponse
 */

export class GoogleSheets {
  /** @type {Map<string, Promise<any>>} */
  ongoingRequests = new Map();

  /**
   * @param {string} userUuid
   * @returns {Promise<UserData>}
   */
  async login(userUuid) {
    const requestKey = `login-${userUuid}`;

    const resultPromise = this.#deduplicateRequest(requestKey, () => login(userUuid));

    resultPromise
      .then((userInfo) => {
        this.userInfo = userInfo;
      })
      .catch(() => {
        this.userInfo = null;
      });

    return resultPromise;
  }

  /**
   * @param {number} year
   * @param {number} week
   * @param {boolean} [useCache]
   * @returns {Promise<GetEntriesBetweenDatesResponse[]>}
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
