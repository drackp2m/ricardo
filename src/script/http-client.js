import { url } from './config.js';

/**
 * @template T
 * @typedef {import('../definition/google-sheets/google-sheets.response.mjs').GoogleSheetsResponse<T>} GoogleSheetsResponse<T>
 */

class HttpClient {
  /** @type {Map<string, Promise<any>>} */
  #ongoingRequests = new Map();
  #tokenRefreshPromise = null;

  /**
   * @template T
   * @param {object} request
   * @param {boolean} [retry=true]
   * @returns {Promise<GoogleSheetsResponse<T>>}
   */
  async request(request, retry = true) {
    const GOOGLE_SCRIPT_URL = url.googleSheets;
    const requestKey = JSON.stringify(request);

    const authToken = localStorage.getItem('authToken');

    return this.#deduplicateRequest(requestKey, async () => {
      const body = new URLSearchParams({
        ...(authToken !== null ? { authToken } : {}),
        ...request,
      });

      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          body,
        });

        const data = await response.json();

        if (data.success === false && data.error === 'error_expired.jwt' && retry === true) {
          const refreshResult = await this.#refreshTokens();

          if (refreshResult === false) {
            return data;
          }

          this.#ongoingRequests.delete(requestKey);

          return this.request(request, false);
        }

        if (data.success === false && data.error === 'error_required_parameter.authToken') {
          window.location.href = '/page/login?reason=session_expired';
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
  async #refreshTokens() {
    if (this.#tokenRefreshPromise) {
      return this.#tokenRefreshPromise;
    }

    this.#tokenRefreshPromise = (async () => {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken === null) {
        throw new Error('error_not_found.refresh_token');
      }

      const body = new URLSearchParams({ action: 'refreshAuthTokens', refreshToken });

      try {
        const response = await fetch(url.googleSheets, {
          method: 'POST',
          body,
        });

        const { success, data } = await response.json();

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
