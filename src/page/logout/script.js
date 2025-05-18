import { main } from '../../script.js';
import { sessionManager } from '../../script/session-manager.js';

main.onReady(async () => {
  sessionManager.logout();

  window.location.href = '/page/login';
});
