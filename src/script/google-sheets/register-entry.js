import { url } from '../config.js';

/**
 * @template T
 * @typedef {import('../../definition/google-sheets/google-sheets.response.mjs').GoogleSheetsResponse<T>} GoogleSheetsResponse<T>
 */

/**
 * @param {string} date
 * @param {string} entryTime
 * @param {string} exitTime
 * @returns {Promise<GoogleSheetsResponse<undefined>>}
 */
export async function registerEntry(date, entryTime, exitTime) {
  const GOOGLE_SCRIPT_URL = url.googleSheets;
  const userUuid = localStorage.getItem('userUuid');

  if (userUuid === null) {
    window.location.href = url.basePathname;

    return { success: false, error: 'User UUID is null' };
  }

  const request = new URLSearchParams({
    action: 'registerEntry',
    userUuid,
    date,
    entryTime,
    exitTime,
  });

  return await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: request })
    .then((res) => res.json())
    .catch((error) => {
      return { success: false, error: error.message };
    });
}
