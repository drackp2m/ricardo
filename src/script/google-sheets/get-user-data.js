import { url } from '../config.js';
import { httpClient } from '../http-client.js';

/**
 * @template T
 * @typedef {import('../../definition/google-sheets/google-sheets.response.mjs').GoogleSheetsResponse<T>} GoogleSheetsResponse<T>
 */

/**
 * @returns {Promise<GoogleSheetsResponse<undefined>>}
 */
export async function getUserData() {
  return httpClient.request({
    action: 'getUserData',
  });
}
