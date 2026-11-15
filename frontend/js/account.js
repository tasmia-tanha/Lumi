function showToast(text, duration = 2400) {
  Toastify({
    text,
    duration,
    gravity: "top",
    position: "right",
  }).showToast();
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    const response = await fetch("/logout", {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Could not log out. Please try again.");
    }

    window.location.href = "/";
  } catch (error) {
    showToast(error.message);
  }
});

// Change password
const changePasswordForm = document.getElementById("changePasswordForm");
const changePasswordBtn = document.getElementById("changePasswordBtn");

changePasswordForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(changePasswordForm);

  const passwordData = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  changePasswordBtn.disabled = true;
  changePasswordBtn.textContent = "Updating...";

  try {
    const response = await fetch("/account/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordData),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage =
        result.errors?.currentPassword?.msg ||
        result.errors?.newPassword?.msg ||
        result.errors?.confirmPassword?.msg ||
        result.errors?.common?.msg ||
        result.message ||
        "Could not update password. Please try again.";

      throw new Error(errorMessage);
    }

    showToast("Password changed successfully! Logging you out.");

    changePasswordForm.reset();

    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  } catch (error) {
    showToast(error.message);
  } finally {
    changePasswordBtn.disabled = false;
    changePasswordBtn.textContent = "Update Password";
  }
});

// Generate recovery code
const generateRecoveryCodeBtn = document.getElementById(
  "generateRecoveryCodeBtn",
);

const recoveryCodeContainer = document.getElementById("recoveryCodeContainer");

const recoveryCodeInput = document.getElementById("recoveryCode");

const copyRecoveryCodeBtn = document.getElementById("copyRecoveryCodeBtn");

generateRecoveryCodeBtn.addEventListener("click", async () => {
  generateRecoveryCodeBtn.disabled = true;
  generateRecoveryCodeBtn.textContent = "Generating...";

  try {
    const response = await fetch("/account/generate-recovery-code", {
      method: "POST",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Could not generate recovery code.");
    }

    // Display the newly generated code.
    recoveryCodeInput.value = result.recoveryCode;
    recoveryCodeContainer.hidden = false;

    generateRecoveryCodeBtn.textContent = "Regenerate Recovery Code";

    showToast("Recovery code generated! Save it somewhere safe.");
  } catch (error) {
    showToast(error.message);
  } finally {
    generateRecoveryCodeBtn.disabled = false;

    if (generateRecoveryCodeBtn.textContent === "Generating...") {
      generateRecoveryCodeBtn.textContent = "Generate Recovery Code";
    }
  }
});

// Copy recovery code
copyRecoveryCodeBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(recoveryCodeInput.value);

    showToast("Recovery code copied successfully!");
  } catch (error) {
    showToast("Could not copy the code. Please copy it manually.");
  }
});
