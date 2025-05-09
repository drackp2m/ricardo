import { url } from '../config.js';

export async function refreshToken() {
  const GOOGLE_SCRIPT_URL = url.googleSheets;
  const refreshToken = localStorage.getItem('refreshToken');

  if (refreshToken === null) {
    window.location.href = url.basePathname;

    return { success: false, error: 'error_not_found.refresh_token' };
  }

  const request = new URLSearchParams({
    action: 'refreshAuthToken',
    refreshToken,
  });

  return await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: request })
    .then((res) => res.json())
    .catch((error) => {
      return { success: false, error: error.message };
    });
}