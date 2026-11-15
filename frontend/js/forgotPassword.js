
const recoveryForm = document.getElementById("recoveryForm");
const resetPasswordBtn = document.getElementById("resetPasswordBtn");
const recoveryError = document.getElementById("recoveryError");

function showMessage(message, isSuccess = false) {
  recoveryError.textContent = message;
  recoveryError.classList.add("visible");

  if (isSuccess) {
    recoveryError.style.color = "#587b59";
  } else {
    recoveryError.style.color = "#c34d60";
  }
}

recoveryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  recoveryError.classList.remove("visible");
  recoveryError.textContent = "";

  const formData = new FormData(recoveryForm);

  const recoveryData = {
    email: formData.get("email").trim(),
    recoveryCode: formData.get("recoveryCode").trim(),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  resetPasswordBtn.disabled = true;
  resetPasswordBtn.textContent = "Resetting...";

  try {
    const response = await fetch("/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recoveryData),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage =
        result.errors?.email?.msg ||
        result.errors?.recoveryCode?.msg ||
        result.errors?.newPassword?.msg ||
        result.errors?.confirmPassword?.msg ||
        result.errors?.common?.msg ||
        result.message ||
        "Could not reset your password. Please try again.";

      throw new Error(errorMessage);
    }

    showMessage(
      "Password reset successfully! Redirecting to login...",
      true
    );

    recoveryForm.reset();

    setTimeout(() => {
      window.location.href = "/";
    }, 1800);

  } catch (error) {
    showMessage(error.message);
  } finally {
    resetPasswordBtn.disabled = false;
    resetPasswordBtn.textContent = "Reset Password →";
  }
});
