import { mainReady } from '../../../script.js';
import { FormManager } from '../../../script/form-manager.js';
import { GoogleSheets } from '../../../script/google-sheets/main.js';
import { Logger } from '../../../script/logger.js';
import { splitByLastOccurrence } from '../../../script/utils.js';

mainReady.then(() => {
  const formManager = new FormManager('register-form', 'feedback');
  const googleSheets = new GoogleSheets();

  const urlSearchParams = new URLSearchParams(window.location.search);

  const emailAndCode = decodeURIComponent(urlSearchParams.get('code'));

  if (emailAndCode === 'null') {
    formManager.showError('Invalid link. Form disabled.', 0);
    formManager.disable();

    return;
  }

  const [email, code] = splitByLastOccurrence(atob(emailAndCode), '.');

  formManager.setData({ email });

  formManager.onSubmit(async () => {
    const { password, repeatPassword } = formManager.getData();
    formManager.disable('login-form-submit');

    if (password !== repeatPassword) {
      formManager.showError('Passwords do not match.');
      formManager.enable();

      return;
    }

    const response = await googleSheets.registerPassword(email, code, password);

    if (response.error) {
      formManager.showError(response.error);
      formManager.enable();

      return;
    }

    formManager.showSuccess('Registration successful!');

    const { authToken, refreshToken } = response.data;

    localStorage.setItem('authToken', authToken);
    localStorage.setItem('refreshToken', refreshToken);

    document.location.href = '/page/clock-in';
  });
});
