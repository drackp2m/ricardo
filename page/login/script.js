import '../../script.js';

import { url } from "../../script/config.js";

window.onload = function () {
  const GOOGLE_SCRIPT_URL = url.googleSheets;

  document.getElementById("userForm").onsubmit = function (e) {
    e.preventDefault();

    const userUuid = document.getElementById("userUuid").value.trim();

    if (!userUuid) {
      showError("Please enter a valid user ID", form);
      return;
    }

    document.getElementById("errorMessage").innerHTML = "&nbsp;";

    const form = document.getElementById("userForm");

    Array.from(form.elements).forEach((el) => (el.disabled = true));
    document.getElementById("userFormSubmit").classList.add("loading");

    const body = new URLSearchParams({
      action: "login",
      userUuid,
    });

    fetch(`${GOOGLE_SCRIPT_URL}`, { method: "POST", body })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          localStorage.setItem("userUuid", userUuid);
          localStorage.setItem("userName", response.data.name);
          localStorage.setItem("userSurname", response.data.surname);

          window.location.href = "/page/form";
        } else {
          showError(response.error || "User not found", form);
        }
      })
      .catch(() => {
        showError("Connection error", form);
      });
  };

  function showError(message, form) {
    const errorElement = document.getElementById("errorMessage");
    errorElement.textContent = message;
  
    Array.from(form.elements).forEach((el) => (el.disabled = false));
    document.getElementById("userFormSubmit").classList.remove("loading");
  }
};
