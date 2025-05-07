import { url } from '../config.js';

/**
 * @param {string} clientId
 * @param {string} credential
 * @returns {Promise<Object>}
 */
export async function registerWithGoogle(clientId, credential) {
  const GOOGLE_SCRIPT_URL = url.googleSheets;

  const request = new URLSearchParams({
    action: 'registerWithGoogle',
    clientId,
    credential,
  });

  return await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: request })
    .then((res) => res.json())
    .catch((error) => {
      return { success: false, error: error.message };
    });
}
