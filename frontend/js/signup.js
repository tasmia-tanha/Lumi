const successToast = Toastify({
  text: "User registered successfully",
  duration: 3000,
});

const form = document.querySelector(".user_info");
const signUpBtn = document.getElementById("signUpBtn");

const originalButtonHTML = signUpBtn.innerHTML;

form.querySelectorAll("input").forEach((input) => {
  input.addEventListener("input", () => {
    input.classList.remove("error");

    const errorClass =
      input.name === "confirmPassword"
        ? "confirm-password-error"
        : `${input.name}-error`;

    const errorMessage = document.querySelector(`.${errorClass}`);

    if (errorMessage) {
      errorMessage.classList.remove("visible");
    }
  });
});

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  if (signUpBtn.disabled) return;

  // Loading state
  signUpBtn.disabled = true;
  signUpBtn.setAttribute("aria-busy", "true");
  signUpBtn.innerHTML = `
    <span class="loadingSpinner"></span>
    Creating account...
  `;

  let successful = false;

  try {
    const formData = new URLSearchParams(new FormData(form));

    const response = await fetch("/signup", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok && !result.errors) {
      throw new Error("Something went wrong. Please try again.");
    }

    if (result.errors) {
      Object.keys(result.errors).forEach((fieldName) => {
        if (fieldName === "common") {
          const errorPlaceholder = document.querySelector(".common-error");

          errorPlaceholder.textContent = result.errors[fieldName].msg;
          errorPlaceholder.classList.add("visible");
          return;
        }

        const input = form.elements.namedItem(fieldName);

        if (!input) return;

        input.classList.add("error");

        const errorClass =
          input.name === "confirmPassword"
            ? "confirm-password-error"
            : `${input.name}-error`;

        const errorPlaceholder = document.querySelector(`.${errorClass}`);

        if (errorPlaceholder) {
          errorPlaceholder.textContent = result.errors[fieldName].msg;
          errorPlaceholder.classList.add("visible");
        }
      });
    } else {
      successful = true;

      successToast.showToast();

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  } catch (error) {
    const errorPlaceholder = document.querySelector(".common-error");

    errorPlaceholder.textContent =
      error.message || "Something went wrong. Please try again.";

    errorPlaceholder.classList.add("visible");
  } finally {
    if (!successful) {
      signUpBtn.disabled = false;
      signUpBtn.removeAttribute("aria-busy");
      signUpBtn.innerHTML = originalButtonHTML;
    }
  }
});
