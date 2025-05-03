import { mainReady } from '../../script.js';
import { url } from '../../script/config.js';
import { FormManager } from '../../script/form-manager.js';
import { GoogleSheets } from '../../script/google-sheets/main.js';

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
