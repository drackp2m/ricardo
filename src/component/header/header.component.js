import { sessionManager } from '../../script/session-manager.js';

export const headerComponent = async () => {
  const userData = await sessionManager.getUserData();

  if (userData === null) {
    return;
  }

  const nameElement = document.getElementById('name');

  const nameAndSurname = `${userData.name} ${userData.surname}`;

  nameElement.textContent = nameAndSurname;
}