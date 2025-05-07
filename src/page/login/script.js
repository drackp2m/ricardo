import { mainReady } from '../../script.js';
import { url } from '../../script/config.js';
import { FormManager } from '../../script/form-manager.js';
import { GoogleSheets } from '../../script/google-sheets/main.js';

// @ts-ignore
window.handleGoogleLogin = function (response) {
  console.log('Google login response received:', response);

  const clientId = response.clientId;
  const credential = response.credential;

  const googleSheets = new GoogleSheets();
  const formManager = new FormManager('login-form', 'feedback');

  formManager.disable('login-form-submit');

  googleSheets.registerWithGoogle(clientId, credential).then((response) => {
    if (response.success) {
      // localStorage.setItem('userUuid', response.data.uuid);
      // localStorage.setItem('userName', response.data.name);
      // localStorage.setItem('userSurname', response.data.surname);
      // localStorage.setItem('userEmail', response.data.email);
      // localStorage.setItem('userPicture', response.data.picture);
      // localStorage.setItem('loginMethod', 'google');

      if (response.data.status === 'PENDING') {
        formManager.showSuccess('Tu cuenta está pendiente de aprobación por un administrador.');
        setTimeout(() => {
          window.location.href = `${url.basePathname}`;
        }, 3000);
        return;
      }

      window.location.href = `${url.basePathname}page/clock-in`;
    } else {
      formManager.showError(response.error || 'Error en la autenticación con Google');
      formManager.enable();
    }
  });
};

mainReady.then(() => {
  const formManager = new FormManager('login-form', 'feedback');
  const googleSheets = new GoogleSheets();

  const loginFormElement =
    /** @type {HTMLFormElement|null} */
    (document.getElementById('login-form'));
  const userUuidInputElement =
    /** @type {HTMLInputElement|null} */
    (document.getElementById('user-uuid-input'));

  loginFormElement.onsubmit = function (e) {
    e.preventDefault();

    const { userUuid } = formManager.getData();

    formManager.disable('login-form-submit');

    if (userUuid === '') {
      formManager.showError('User identifier is required');
      formManager.enable();
      return;
    }

    googleSheets.login(userUuid).then((response) => {
      if (response.success) {
        localStorage.setItem('userUuid', userUuid);
        localStorage.setItem('userName', response.data.name);
        localStorage.setItem('userSurname', response.data.surname);

        window.location.href = `${url.basePathname}page/clock-in`;
      } else {
        formManager.showError(response.error || 'User not found');
        formManager.enable();
      }
    });
  };
});
