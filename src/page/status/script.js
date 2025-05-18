import { main } from '../../script.js';
import { sessionManager } from '../../script/session-manager.js';

main.onReady(async () => {
  const userStatus = (await sessionManager.getUserData()).status;

  switch(userStatus) {
    case 'PENDING':
      const pendingParagraph = document.querySelector('#pending');
      pendingParagraph.classList.remove('hidden');
      break;
  }
});
