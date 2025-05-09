import { url } from './config.js';

export class HttpClient {
  /** @type {Map<string, Promise<any>>} */
  #ongoingRequests = new Map();
  #tokenRefreshPromise = null;

  /**
   * @template T
   * @param {object} request
   * @param {boolean} [retry=true]
   * @returns {Promise<T>}
   */
  async request(request = {}, retry = true) {
    const GOOGLE_SCRIPT_URL = url.googleSheets;
    const requestKey = JSON.stringify(request);

    const authToken = localStorage.getItem('authToken');

    return this.#deduplicateRequest(requestKey, async () => {
      const body = new URLSearchParams({ authToken, ...request });

      console.log('Fetching:', request);

      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          body,
        });

        const data = await response.json();

        if (data.success === false && data.error === 'error_expired.jwt' && retry === true) {
          const refreshResult = await this.refreshToken();

          if (refreshResult === false) {
            return data;
          }

          this.#ongoingRequests.delete(requestKey);

          return this.request(request, false);
        }

        return data;
      } catch (error) {
        return {
          success: false,
          error: 'error_network',
        };
      }
    });
  }

  /**
   * @returns {Promise<boolean>}
   */
  async refreshToken() {
    console.log('Token expired, refreshing...');

    if (this.#tokenRefreshPromise) {
      return this.#tokenRefreshPromise;
    }

    this.#tokenRefreshPromise = (async () => {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken === null) {
        throw new Error('error_not_found.refresh_token');
      }

      const body = new URLSearchParams({ action: 'refreshAuthToken', refreshToken });

      try {
        const response = await fetch(url.googleSheets, {
          method: 'POST',
          body,
        });

        const { success, data } = await response.json();

        console.log('Token refresh response:', data);

        if (success === true) {
          localStorage.setItem('authToken', data.authToken);
          localStorage.setItem('refreshToken', data.refreshToken);

          return true;
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');

          window.location.href = '/page/login?reason=session_expired';

          return false;
        }
      } catch (error) {
        console.error('Error on refresh token:', error);

        return false;
      } finally {
        this.#tokenRefreshPromise = null;
      }
    })();

    return this.#tokenRefreshPromise;
  }

  /**
   * @template T
   * @param {string} requestKey
   * @param {() => Promise<T>} promiseFn
   * @returns {Promise<T>}
   */
  #deduplicateRequest(requestKey, promiseFn) {
    if (this.#ongoingRequests.has(requestKey)) {
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

export const httpClient = new HttpClient();
