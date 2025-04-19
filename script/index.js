const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwyGR1kIva44IQDisCSGro8rW-ssa6mkyS72sIkUekGNnSeCXufdrNskkwceG3Lql-y/exec";

document.getElementById("userForm").onsubmit = function (e) {
  e.preventDefault();
  const uuid = document.getElementById("uuid").value.trim();

  if (!uuid) {
    showError("Please enter a valid user ID");
    return;
  }

  const userNameDiv = document.getElementById("userName");
  const continueButton = document.getElementById("continueButton");
  userNameDiv.style.display = "none";
  continueButton.style.display = "none";
  document.getElementById("errorMessage").style.display = "none";

  const script = document.createElement("script");
  const callback = "callback_" + Date.now();

  window[callback] = function (response) {
    if (response.success && response.name) {
      userNameDiv.textContent = "Nombre: " + response.name;
      userNameDiv.style.display = "block";
      localStorage.setItem("userUuid", uuid);
      localStorage.setItem("userName", response.name);
      continueButton.style.display = "block";
    } else {
      showError(response.error || "User not found");
    }
    document.body.removeChild(script);
    delete window[callback];
  };

  script.src = `${GOOGLE_SCRIPT_URL}?action=getName&uuid=${encodeURIComponent(
    uuid
  )}&callback=${callback}`;
  document.body.appendChild(script);
};

function showError(message) {
  const errorElement = document.getElementById("errorMessage");
  errorElement.textContent = message;
  errorElement.style.display = "block";
}
