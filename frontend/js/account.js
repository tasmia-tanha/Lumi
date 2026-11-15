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
