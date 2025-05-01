import { url } from '../config.js';

/**
 * @typedef {import('../../definition/google-sheets/login.response.mjs').LoginResponse} UserData
 */

/**
 * @param {string} userUuid
 * @returns {Promise<UserData>}
 */
export const login = async (userUuid) => {
  const body = new URLSearchParams({
    action: 'login',
    userUuid,
  });

  return fetch(`${url.googleSheets}`, { method: 'POST', body })
    .then((res) => res.json())
    .then((response) => {
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'User not found');
      }
    })
    .catch(() => {
      throw new Error('Connection error');
    });
};
