import { url } from '../config.js';

/**
 * @template T
 * @typedef {import('../../definition/google-sheets/google-sheets.response.mjs').GoogleSheetsResponse<T>} GoogleSheetsResponse<T>
 */

/**
 * @typedef {import('../../definition/google-sheets/login.response.mjs').LoginResponse} LoginResponse
 */

/**
 * @param {string} userUuid
 * @returns {Promise<GoogleSheetsResponse<LoginResponse>>}
 */
export const login = async (userUuid) => {
  const body = new URLSearchParams({
    action: 'login',
    userUuid,
  });

  return fetch(`${url.googleSheets}`, { method: 'POST', body })
    .then((res) => res.json())
    .catch((error) => {
      return { success: false, error: error.message };
    });
};
