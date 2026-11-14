const pageData = JSON.parse(
  document.getElementById("lessonsPageData").textContent,
);

let subjects = pageData.subjects || [];
let lessons = pageData.lessons || [];
let materials = pageData.materials || [];

const subjectSelect = document.getElementById("subjectSelect");
const lessonSubjectSelect = document.getElementById("lessonSubjectSelect");
const materialSubjectSelect = document.getElementById("materialSubjectSelect");

const lessonList = document.getElementById("lessonList");
const materialList = document.getElementById("materialList");

const noLessonsMessage = document.getElementById("noLessonsMessage");
const noMaterialsMessage = document.getElementById("noMaterialsMessage");

let toastTimeout;

function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.toggle("error", isError);
  toast.classList.add("show");

  clearTimeout(toastTimeout);

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Something went wrong.");
  }

  return result;
}

function getSelectedSubject() {
  return subjectSelect.value;
}

function updateSubjectOptions() {
  const currentMainValue = subjectSelect.value || "all";
  const currentLessonValue = lessonSubjectSelect.value;
  const currentMaterialValue = materialSubjectSelect.value;

  subjectSelect.innerHTML = "";
  subjectSelect.add(new Option("All subjects", "all"));

  lessonSubjectSelect.innerHTML = "";
  lessonSubjectSelect.add(new Option("Choose a subject", ""));

  materialSubjectSelect.innerHTML = "";
  materialSubjectSelect.add(new Option("Choose a subject", ""));

  subjects.forEach((subject) => {
    const id = String(subject._id);

    subjectSelect.add(new Option(subject.name, id));
    lessonSubjectSelect.add(new Option(subject.name, id));
    materialSubjectSelect.add(new Option(subject.name, id));
  });

  if (
    [...subjectSelect.options].some(
      (option) => option.value === currentMainValue,
    )
  ) {
    subjectSelect.value = currentMainValue;
  }

  if (
    [...lessonSubjectSelect.options].some(
      (option) => option.value === currentLessonValue,
    )
  ) {
    lessonSubjectSelect.value = currentLessonValue;
  }

  if (
    [...materialSubjectSelect.options].some(
      (option) => option.value === currentMaterialValue,
    )
  ) {
    materialSubjectSelect.value = currentMaterialValue;
  }
}

function renderLessons() {
  const selectedSubject = getSelectedSubject();

  const filteredLessons = lessons.filter((lesson) => {
    const lessonSubjectId = String(lesson.subject?._id || lesson.subject);

    return selectedSubject === "all" || lessonSubjectId === selectedSubject;
  });

  lessonList.innerHTML = "";

  if (filteredLessons.length === 0) {
    lessonList.innerHTML = `
          <div class="emptyState">
            <span>🌱</span>
            <h3>${selectedSubject === "all" ? "No lessons yet!" : "No lessons in this subject yet."}</h3>
            <p>Add a lesson and start learning.</p>
          </div>
        `;
  } else {
    filteredLessons.forEach((lesson) => {
      const isCompleted = lesson.status === "completed";
      const subject = subjects.find(
        (item) =>
          String(item._id) === String(lesson.subject?._id || lesson.subject),
      );

      const article = document.createElement("article");
      article.className = `lessonItem ${isCompleted ? "isCompleted" : ""}`;
      article.dataset.lessonId = lesson._id;
      article.dataset.subjectId = lesson.subject?._id || lesson.subject;
      article.dataset.status = lesson.status;

      const label = document.createElement("label");
      label.className = "lessonCheckboxLabel";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "lessonCheckbox";
      checkbox.checked = isCompleted;
      checkbox.setAttribute("aria-label", `Mark ${lesson.title} completed`);

      const customCheckbox = document.createElement("span");
      customCheckbox.className = "customCheckbox";

      label.append(checkbox, customCheckbox);

      const info = document.createElement("div");
      info.className = "lessonInfo";

      const title = document.createElement("h3");
      title.className = "lessonTitle";
      title.textContent = lesson.title;

      const subjectName = document.createElement("p");
      subjectName.className = "lessonSubject";
      subjectName.textContent =
        subject?.name || lesson.subject?.name || "Subject";

      info.append(title, subjectName);

      const status = document.createElement("span");
      status.className = "lessonStatus";
      status.textContent = isCompleted ? "Completed" : "In progress";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "deleteItemBtn";
      deleteButton.dataset.deleteType = "lessons";
      deleteButton.dataset.id = lesson._id;
      deleteButton.setAttribute("aria-label", "Delete lesson");
      deleteButton.textContent = "🗑️";

      article.append(label, info, deleteButton, status);
      lessonList.appendChild(article);
    });
  }

  updateProgress();
}

function renderMaterials() {
  const selectedSubject = getSelectedSubject();

  const filteredMaterials = materials.filter((material) => {
    const materialSubjectId = String(material.subject?._id || material.subject);

    return selectedSubject === "all" || materialSubjectId === selectedSubject;
  });

  materialList.innerHTML = "";

  if (filteredMaterials.length === 0) {
    materialList.innerHTML = `
          <div class="emptyState">
            <span>📖</span>
            <h3>No materials yet</h3>
            <p>Add links to slides, PDFs, videos, or notes.</p>
          </div>
        `;
    return;
  }

  filteredMaterials.forEach((material) => {
    const subject = subjects.find(
      (item) =>
        String(item._id) === String(material.subject?._id || material.subject),
    );

    const article = document.createElement("article");
    article.className = "materialItem";
    article.dataset.subjectId = material.subject?._id || material.subject;

    const icon = document.createElement("div");
    icon.className = "materialIcon";
    icon.textContent = "📄";

    const info = document.createElement("div");
    info.className = "materialInfo";

    const title = document.createElement("a");
    title.className = "materialTitle";
    title.textContent = material.title;
    title.href = material.url;
    title.target = "_blank";
    title.rel = "noopener noreferrer";

    const subjectName = document.createElement("p");
    subjectName.textContent =
      subject?.name || material.subject?.name || "Subject";

    info.append(title, subjectName);

    const openLink = document.createElement("a");
    openLink.className = "openMaterial";
    openLink.href = material.url;
    openLink.target = "_blank";
    openLink.rel = "noopener noreferrer";
    openLink.textContent = "↗";
    openLink.setAttribute("aria-label", `Open ${material.title}`);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "deleteItemBtn";
    deleteButton.dataset.deleteType = "materials";
    deleteButton.dataset.id = material._id;
    deleteButton.setAttribute("aria-label", "Delete course material");
    deleteButton.textContent = "🗑️";

    article.append(icon, info, openLink, deleteButton);
    materialList.appendChild(article);
  });
}

function updateProgress() {
  const completedCount = lessons.filter(
    (lesson) => lesson.status === "completed",
  ).length;

  const totalCount = lessons.length;

  const progress =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  document.getElementById("completedCount").textContent = completedCount;
  document.getElementById("totalCount").textContent = totalCount;
  document.getElementById("overallProgressBar").style.width = `${progress}%`;
  document.getElementById("overallProgressText").textContent =
    `${progress}% completed`;
}

function openModal(id) {
  if (id === "lessonModal" && subjects.length === 0) {
    showToast("Add a subject before adding a lesson.", true);
    return;
  }

  if (id === "materialModal" && subjects.length === 0) {
    showToast("Add a subject before adding course material.", true);
    return;
  }

  document.getElementById(id).classList.remove("hidden");

  if (id === "lessonModal" && getSelectedSubject() !== "all") {
    lessonSubjectSelect.value = getSelectedSubject();
  }

  if (id === "materialModal" && getSelectedSubject() !== "all") {
    materialSubjectSelect.value = getSelectedSubject();
  }
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

document.getElementById("addSubjectBtn").addEventListener("click", () => {
  openModal("subjectModal");
});

document.getElementById("addLessonBtn").addEventListener("click", () => {
  openModal("lessonModal");
});

document.getElementById("addMaterialBtn").addEventListener("click", () => {
  openModal("materialModal");
});

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () => {
    closeModal(button.dataset.close);
  });
});

document.querySelectorAll(".modalOverlay").forEach((overlay) => {
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      overlay.classList.add("hidden");
    }
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modalOverlay").forEach((modal) => {
      modal.classList.add("hidden");
    });
  }
});

subjectSelect.addEventListener("change", () => {
  renderLessons();
  renderMaterials();
});

document
  .getElementById("subjectForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const subjectForm = event.target;
    const submitBtn = subjectForm.querySelector("button[type='submit']");
    const originalHTML = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
  <span class="loadingSpinner"></span>
  Saving Subject...
`;

    const name = document.getElementById("subjectName").value.trim();

    try {
      const result = await apiRequest("/lessons/subjects", {
        method: "POST",
        body: JSON.stringify({
          name,
        }),
      });

      subjects.push(result.subject);
      subjects.sort((a, b) => a.name.localeCompare(b.name));

      updateSubjectOptions();

      subjectSelect.value = String(result.subject._id);
      lessonSubjectSelect.value = String(result.subject._id);
      materialSubjectSelect.value = String(result.subject._id);

      document.getElementById("subjectForm").reset();
      closeModal("subjectModal");

      renderLessons();
      renderMaterials();

      showToast(result.message || "Subject added!");
    } catch (error) {
      showToast(error.message, true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  });

document
  .getElementById("lessonForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const lessonForm = event.target;
    const submitBtn = lessonForm.querySelector("button[type='submit']");
    const originalHTML = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
  <span class="loadingSpinner"></span>
  Saving Lesson...
`;

    const title = document.getElementById("lessonTitleInput").value.trim();
    const subjectId = lessonSubjectSelect.value;

    try {
      const result = await apiRequest("/lessons/lessons", {
        method: "POST",
        body: JSON.stringify({
          title,
          subjectId,
        }),
      });

      lessons.unshift(result.lesson);

      subjectSelect.value = String(subjectId);

      document.getElementById("lessonForm").reset();
      closeModal("lessonModal");

      renderLessons();
      renderMaterials();

      showToast(result.message || "Lesson added!");
    } catch (error) {
      showToast(error.message, true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  });

document
  .getElementById("materialForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const materialForm = event.target;
    const submitBtn = materialForm.querySelector("button[type='submit']");
    const originalHTML = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `
  <span class="loadingSpinner"></span>
  Saving Material...
`;

    const title = document.getElementById("materialTitleInput").value.trim();
    const url = document.getElementById("materialUrlInput").value.trim();
    const subjectId = materialSubjectSelect.value;

    try {
      const result = await apiRequest("/lessons/materials", {
        method: "POST",
        body: JSON.stringify({
          title,
          url,
          subjectId,
        }),
      });

      materials.unshift(result.material);

      subjectSelect.value = String(subjectId);

      document.getElementById("materialForm").reset();
      closeModal("materialModal");

      renderLessons();
      renderMaterials();

      showToast(result.message || "Course material added!");
    } catch (error) {
      showToast(error.message, true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  });

lessonList.addEventListener("change", async (event) => {
  if (!event.target.matches(".lessonCheckbox")) {
    return;
  }

  const checkbox = event.target;
  const article = checkbox.closest(".lessonItem");
  const lessonId = article.dataset.lessonId;

  const lesson = lessons.find((item) => String(item._id) === String(lessonId));

  if (!lesson) {
    return;
  }

  const previousStatus = lesson.status;
  const newStatus = checkbox.checked ? "completed" : "inProgress";

  checkbox.disabled = true;
  article.classList.add("is-updating");

  try {
    await apiRequest(`/lessons/lessons/${lessonId}`, {
      method: "PATCH",
      body: JSON.stringify({
        status: newStatus,
      }),
    });

    lesson.status = newStatus;

    renderLessons();

    showToast(
      newStatus === "completed"
        ? "Lesson completed! Great job 🌷"
        : "Lesson marked as in progress.",
    );
  } catch (error) {
    lesson.status = previousStatus;
    checkbox.checked = previousStatus === "completed";
    showToast(error.message, true);
  } finally {
    checkbox.disabled = false;
    article.classList.remove("is-updating");
  }
});

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
    showToast(error.message, true);
  }
});
const deleteItemModal = document.getElementById("deleteItemModal");
const deleteModalMessage = document.getElementById("deleteModalMessage");
const cancelDeleteItem = document.getElementById("cancelDeleteItem");
const confirmDeleteItem = document.getElementById("confirmDeleteItem");

let itemToDelete = null;

// Open the modal when a delete button is clicked
document.addEventListener("click", (event) => {
  const button = event.target.closest(".deleteItemBtn");

  if (!button) return;

  const type = button.dataset.deleteType;
  const id = button.dataset.id;

  const article = button.closest(".lessonItem, .materialItem");

  const titleElement = article.querySelector(
    type === "lessons" ? ".lessonTitle" : ".materialTitle",
  );

  const itemTitle = titleElement.textContent.trim();

  itemToDelete = {
    type,
    id,
    button,
  };

  deleteModalMessage.textContent = `Are you sure you want to permanently delete "${itemTitle}"?`;

  deleteItemModal.hidden = false;

  cancelDeleteItem.focus();
});

// Cancel deletion
cancelDeleteItem.addEventListener("click", () => {
  deleteItemModal.hidden = true;
  itemToDelete = null;
});

// Close when clicking outside the modal
deleteItemModal.addEventListener("click", (event) => {
  if (event.target === deleteItemModal) {
    deleteItemModal.hidden = true;
    itemToDelete = null;
  }
});

// Close with Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !deleteItemModal.hidden) {
    deleteItemModal.hidden = true;
    itemToDelete = null;
  }
});

// Confirm deletion
confirmDeleteItem.addEventListener("click", async () => {
  if (!itemToDelete) return;

  const { type, id } = itemToDelete;

  confirmDeleteItem.disabled = true;
  confirmDeleteItem.innerHTML = `
  <span class="loadingSpinner"></span>
  Deleting...
`;

  try {
    const result = await apiRequest(`/lessons/${type}/${id}`, {
      method: "DELETE",
    });

    // Remove the item from the appropriate array
    if (type === "lessons") {
      lessons = lessons.filter((lesson) => String(lesson._id) !== String(id));
    } else {
      materials = materials.filter(
        (material) => String(material._id) !== String(id),
      );
    }

    deleteItemModal.hidden = true;
    itemToDelete = null;

    // Update the page without reloading
    renderLessons();
    renderMaterials();

    showToast(result.message || "Item deleted successfully!");
  } catch (error) {
    showToast(error.message || "Failed to delete item.", true);
  } finally {
    confirmDeleteItem.disabled = false;
    confirmDeleteItem.textContent = "Yes, Delete";
  }
});

updateSubjectOptions();
renderLessons();
renderMaterials();
