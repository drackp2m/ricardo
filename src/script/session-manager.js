import { httpClient } from './http-client.js';
import { Logger } from './logger.js';

/**
 * @typedef {import('../definition/google-sheets/get-user-data.response.mjs').GetUserDataResponse} UserData
 */

class SessionManager {
  /** @type {UserData|null} */
  #userData = null;
  
  /** @type {Promise<UserData|null>|null} */
  #loadUserDataPromise = null;

  /**
   * @returns {boolean}
   */
  isLoggedIn() {
    return localStorage.getItem('authToken') !== null;
  }
  
  /**
   * @returns {Promise<UserData|null>}
   */
  async getUserData() {
    if (this.#userData !== null) {
      return this.#userData;
    }
    
    if (!this.isLoggedIn()) {
      return null;
    }
    
    if (this.#loadUserDataPromise !== null) {
      return this.#loadUserDataPromise;
    }
    
    this.#loadUserDataPromise = this.#fetchUserData()
      .finally(() => {
        this.#loadUserDataPromise = null;
      });
    
    return this.#loadUserDataPromise;
  }
  
  /**
   * @param {...string} roles
   * @returns {Promise<boolean>}
   */
  async hasRole(...roles) {
    const userData = await this.getUserData();
    
    if (!userData) {
      return false;
    }
    
    if (roles.length === 0) {
      return false;
    }
    
    return roles.includes(userData.rol);
  }
  
  /**
   * @param {string} authToken
   * @param {string} refreshToken
   */
  setSession(authToken, refreshToken) {
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    this.#userData = null;
    
    Logger.debug('Session tokens set');
  }
  
  /**
   * @returns {Promise<UserData|null>}
   */
  async refreshUserData() {
    this.#userData = null;
    return this.getUserData();
  }
  
  /**
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    this.#userData = null;
    
    Logger.debug('Session ended');
  }
  
  /**
   * @returns {Promise<UserData|null>}
   */
  async #fetchUserData() {
    try {
      const response = await httpClient.request({
        action: 'getUserData'
      });
      
      if (!response.success) {
        Logger.warning('Failed to get user data', response.error);
        return null;
      }
      
      this.#userData = response.data;
      return this.#userData;
    } catch (error) {
      Logger.error('Error fetching user data', error);
      return null;
    }
  }
}

export const sessionManager = new SessionManager();