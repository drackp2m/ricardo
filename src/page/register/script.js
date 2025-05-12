import { mainReady } from '../../script.js';
import { FormManager } from '../../script/form-manager.js';
import { GoogleSheets } from '../../script/google-sheets/main.js';
import { Logger } from '../../script/logger.js';

mainReady.then(() => {
  const formManager = new FormManager('register-form', 'feedback');
  const googleSheets = new GoogleSheets();

  Logger.info('Register page loaded.', 'user', { name: 'John Doe' });
  Logger.debug('Register page loaded.', 'user', { name: 'John Doe' });
  Logger.error('Register page loaded.', 'user', { name: 'John Doe' });
  Logger.warning('Register page loaded.', 'user', { name: 'John Doe' });
  const pref = Logger.startPerformance('Register');
  setTimeout(() => {
    Logger.endPerformance(pref);
  }, 3000);
  Logger.request('GET', 'https://example.com/api', { name: 'coco' }, 'user', { name: 'John Doe' });
  Logger.response(201, 'https://example.com/api', { error: 'unknown' }, 'user', {
    name: 'John Doe',
  });
  Logger.table('Register page loaded.', { user: 'john doe', password: '1234' });

  formManager.onSubmit(async () => {
    formManager.disable();
    const { name, surname, email, password, repeatPassword } = formManager.getData();

    if (password !== repeatPassword) {
      formManager.showSuccess('Passwords do not match.');
      formManager.enable();

      return;
    }

    return;

    const response = await googleSheets.register(name, surname, email, password);

    if (response.error) {
      formManager.showError(response.error);
      formManager.enable();

      return;
    }

    formManager.showSuccess('Registration successful!');
    formManager.reset();
    formManager.enable();
  });
});
