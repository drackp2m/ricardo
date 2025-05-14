import { mainReady } from '../../script.js';
import { url } from '../../script/config.js';
import { FormManager } from '../../script/form-manager.js';
import { googleSheets } from '../../script/google-sheets/main.js';
import { sessionManager } from '../../script/session-manager.js';

/**
 * @typedef GoogleLoginResponse
 * @property {string} clientId
 * @property {string} client_id
 * @property {string} credential
 * @property {string} select_by
 */

mainReady.then(() => {
  const form = new FormManager('form', 'feedback');

  form.onSubmit(() => {
    const { email, password } = form.getData();
    form.disable('login-form-submit');

    googleSheets.login(email, password).then((response) => {
      if (response.success === false) {
        form.setError(response.error || 'Login failed');
        form.enable();

        return;
      }

      const { authToken, refreshToken } = response.data;

      sessionManager.setSession(authToken, refreshToken);

      window.location.href = `${url.basePathname}page/clock-in`;

    });
  });
});

/**
 * @param {GoogleLoginResponse} response
 * @returns {void}
 */
//@ts-ignore
window.handleGoogleLogin = function (response) {
  const clientId = response.clientId;
  const credential = response.credential;

  const formManager = new FormManager('login-form', 'feedback');

  formManager.disable('login-form-submit');

  googleSheets.loginWithGoogle(clientId, credential).then((response) => {
    if (response.success === false) {
      formManager.setError(response.error || 'Google login failed');
      formManager.enable();

      return;
    }

    const { authToken, refreshToken } = response.data;

    sessionManager.setSession(authToken, refreshToken)

    window.location.href = `${url.basePathname}page/clock-in`;
  });
};
