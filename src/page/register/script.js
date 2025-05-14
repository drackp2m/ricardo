import { mainReady } from '../../script.js';
import { FormManager } from '../../script/form-manager.js';
import { googleSheets } from '../../script/google-sheets/main.js';

mainReady.then(() => {
  const form = new FormManager('register-form', 'feedback');

  form.onSubmit(async () => {
    const referer = location.origin;
    const { name, surname, email } = form.getData();
    form.disable();

    const response = await googleSheets.register(name, surname, email, referer);

    if (response.error) {
      form.setError(response.error);
      form.enable();

      return;
    }

    form.setSuccess('Check your email for the complete registration link.');
    form.reset();
    form.enable();
  });
});
