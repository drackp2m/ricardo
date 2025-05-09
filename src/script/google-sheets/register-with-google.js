import { httpClient } from '../http-client.js';

/**
 * @param {string} clientId
 * @param {string} credential
 * @returns {Promise<Object>}
 */
export function registerWithGoogle(clientId, credential) {
  return httpClient.request({
    action: 'registerWithGoogle',
    clientId,
    credential,
  });
}
