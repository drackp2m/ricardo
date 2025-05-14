import { mainReady } from '../../../script.js';
import { FormManager } from '../../../script/form-manager.js';
import { googleSheets } from '../../../script/google-sheets/main.js';
import { splitByLastOccurrence } from '../../../script/utils.js';

mainReady.then(() => {
  const form = new FormManager('register-form', 'feedback');

  const urlSearchParams = new URLSearchParams(window.location.search);

  const emailAndCode = decodeURIComponent(urlSearchParams.get('code'));

  if (emailAndCode === 'null') {
    form.setError('Invalid link. Form disabled.', 0);
    form.disable();

    return;
  }

  const [email, code] = splitByLastOccurrence(atob(emailAndCode), '.');

  form.setData({ email });

  form.onSubmit(async () => {
    const { password, repeatPassword } = form.getData();
    form.disable('login-form-submit');

    if (password !== repeatPassword) {
      form.setError('Passwords do not match.');
      form.enable();

      return;
    }

    const response = await googleSheets.registerPassword(email, code, password);

    if (response.error) {
      form.setError(response.error);
      form.enable();

      return;
    }

    form.setSuccess('Registration successful!');

    const { authToken, refreshToken } = response.data;

    localStorage.setItem('authToken', authToken);
    localStorage.setItem('refreshToken', refreshToken);

    document.location.href = '/page/clock-in';
  });
});
