import { main } from '../../script.js';
import { sessionManager } from '../../script/session-manager.js';
import { navigateTo } from '../../script/utils.js';

main.onReady(async () => {
  sessionManager.logout();

  navigateTo('/page/login')
});
