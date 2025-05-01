import { mainReady } from '../../script.js';
import { url } from '../../script/config.js';

mainReady.then(() => {
  const userUuid = localStorage.getItem('userUuid');

  if (userUuid !== null) {
    window.location.href = `${url.basePathname}page/clock-in`;
  }

  const GOOGLE_SCRIPT_URL = url.googleSheets;

  const loginFormElement = /** @type {HTMLFormElement|null} */ (
    document.getElementById('login-form')
  );
  const userUuidInputElement = /** @type {HTMLInputElement|null} */ (
    document.getElementById('user-uuid-input')
  );

  loginFormElement.onsubmit = function (e) {
    e.preventDefault();

    const userUuid = userUuidInputElement.value.trim();

    if (userUuid === '') {
      showError('Please enter a valid user ID', loginFormElement);
      return;
    }

    document.getElementById('message').innerHTML = '&nbsp;';

    Array.from(loginFormElement.elements).forEach(
      /** @param {HTMLInputElement} el */ (el) => (el.disabled = true)
    );
    document.getElementById('login-form-submit').classList.add('loading');

    const body = new URLSearchParams({
      action: 'login',
      userUuid,
    });

    fetch(`${GOOGLE_SCRIPT_URL}`, { method: 'POST', body })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          localStorage.setItem('userUuid', userUuid);
          localStorage.setItem('userName', response.data.name);
          localStorage.setItem('userSurname', response.data.surname);

          window.location.href = `${url.basePathname}page/clock-in`;
        } else {
          showError(response.error || 'User not found', loginFormElement);
        }
      })
      .catch(() => {
        showError('Connection error', loginFormElement);
      });
  };

  function showError(message, form) {
    const errorElement = document.getElementById('message');
    errorElement.textContent = message;

    Array.from(form.elements).forEach((el) => (el.disabled = false));
    document.getElementById('login-form-submit').classList.remove('loading');
  }
});
