import { urls } from "./google-sheets.js";

const GOOGLE_SCRIPT_URL = urls.googleSheets;

document.getElementById("userForm").onsubmit = function (e) {
  e.preventDefault();
  const uuid = document.getElementById("uuid").value.trim();

  const form = document.getElementById("userForm");

  if (!uuid) {
    showError("Please enter a valid user ID", form);
    return;
  }

  document.getElementById("errorMessage").innerHTML = "&nbsp;";

  Array.from(form.elements).forEach((el) => (el.disabled = true));
  document.getElementById("userFormSubmit").classList.add("loading");

  const body = new URLSearchParams({
    action: "login",
    uuid: uuid,
  });

  fetch(`${GOOGLE_SCRIPT_URL}`, { method: "POST", body })
    .then((res) => res.json())
    .then((response) => {
      if (response.success && response.name) {
        console.log({ response });
        localStorage.setItem("userUuid", uuid);
        localStorage.setItem("userName", response.name);
        localStorage.setItem("userSurname", response.surname);

        window.location.href = "/page/form.html";
      } else {
        showError(response.error || "User not found", form);
      }
    })
    .catch(() => {
      showError("Error de conexión", form);
    });
};

function showError(message, form) {
  const errorElement = document.getElementById("errorMessage");
  errorElement.textContent = message;

  Array.from(form.elements).forEach((el) => (el.disabled = false));
  document.getElementById("userFormSubmit").classList.remove("loading");
}
