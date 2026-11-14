const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");

loginForm.addEventListener("submit", () => {
  if (!loginForm.checkValidity()) return;

  loginBtn.disabled = true;
  loginBtn.innerHTML = `
      <span class="loadingSpinner"></span>
      Logging in...
    `;
});
