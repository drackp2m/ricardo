import { mainReady } from '../../script.js';
import { FormManager } from '../../script/form-manager.js';
import { GoogleSheets } from '../../script/google-sheets/main.js';

mainReady.then(() => {
  const formManager = new FormManager('register-form', 'feedback');
  const googleSheets = new GoogleSheets();

  formManager.onSubmit(async () => {
    const referer = location.origin;
    const { name, surname, email } = formManager.getData();
    formManager.disable();

    const response = await googleSheets.register(name, surname, email, referer);

    if (response.error) {
      formManager.showError(response.error);
      formManager.enable();

      return;
    }

    formManager.showSuccess('Check your email for the complete registration link.');
    formManager.reset();
    formManager.enable();
  });
});
