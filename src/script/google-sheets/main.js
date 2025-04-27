import { login } from './login.js';
import { getWorkHistory } from './get-work-history.js';

  /**
   * @typedef {Object} PageData
   * @property {string} date
   * @property {string|null} entryTime
   * @property {string|null} in
   * @property {string|null} out
   * @property {string|null} break
   * @property {string|null} total
   */

export class GoogleSheets {
  /**
   * @param {string} userUuid
   * @returns {Promise<{ name: string, surname: string}>}
   */
  async login(userUuid) {
    return login(userUuid);
  }
  
  /**
   * @param {number} year
   * @param {number} week
   * @param {boolean} [useCache]
   * @returns {Promise<PageData[]>}
   */
  async getWorkHistory(year, week, useCache = true) {
    return getWorkHistory(year, week, useCache);
  }
}
