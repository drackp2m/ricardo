import { login } from './login.js';

export class GoogleSheets {
  /**
   * @param {string} userUuid
   * @returns {Promise<{ name: string, surname: string}>}
   */
  async login(userUuid) {
    return login(userUuid);
  }
}
