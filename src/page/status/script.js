import { main } from '../../script.js';
import { sessionManager } from '../../script/session-manager.js';

main.onReady(async () => {
  const userData = await sessionManager.getUserData();

  const { status, name, surname } = userData;

  switch (status) {
    case 'PENDING':
      const pendingParagraph = document.querySelector('#pending');
      pendingParagraph.classList.remove('hidden');
      break;
  }
});
