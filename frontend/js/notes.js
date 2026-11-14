function showToast(message, isError = false) {
  if (window.Toastify) {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: isError ? "#b85f73" : "#84a282",
      },
    }).showToast();
  } else {
    console.error(message);
  }
}
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
const notesList = document.querySelector("#notesList");
const searchInput = document.querySelector("#searchNotes");
const clearTagFilterBtn = document.querySelector("#clearTagFilter");
const activeTagLabel = document.querySelector("#activeTagLabel");
const noSearchResults = document.querySelector("#noSearchResults");

let selectedTag = "";

function getNoteCards() {
  return [...document.querySelectorAll(".noteCard")];
}

function filterNotes() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  getNoteCards().forEach((card) => {
    const matchesSearch =
      card.dataset.title.includes(searchTerm) ||
      card.dataset.content.includes(searchTerm) ||
      card.dataset.tags.includes(searchTerm);

    const tags = card.dataset.tags.split(" ").filter(Boolean);

    const matchesTag = !selectedTag || tags.includes(selectedTag.toLowerCase());

    const visible = matchesSearch && matchesTag;
    card.hidden = !visible;

    if (visible) visibleCount++;
  });

  clearTagFilterBtn.hidden = !selectedTag;
  activeTagLabel.hidden = !selectedTag;
  activeTagLabel.textContent = selectedTag
    ? `Showing notes tagged #${selectedTag}`
    : "";

  document.querySelectorAll(".tagBadge").forEach((button) => {
    button.classList.toggle(
      "selected",
      button.dataset.tag.toLowerCase() === selectedTag.toLowerCase() &&
        selectedTag !== "",
    );
  });

  if (noSearchResults) {
    noSearchResults.hidden = visibleCount !== 0;
  }
}

searchInput?.addEventListener("input", filterNotes);

function selectTag(tag) {
  selectedTag = selectedTag.toLowerCase() === tag.toLowerCase() ? "" : tag;
  filterNotes();
}

document.querySelectorAll(".tagBadge, .noteTag").forEach((button) => {
  button.addEventListener("click", () => {
    selectTag(button.dataset.tag);
  });
});

clearTagFilterBtn?.addEventListener("click", () => {
  selectedTag = "";
  filterNotes();
});

document.querySelectorAll(".pinnedNoteLink").forEach((button) => {
  button.addEventListener("click", () => {
    const card = document.querySelector(
      `[data-note-id="${button.dataset.targetNote}"]`,
    );

    if (card) {
      card.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      card.classList.add("highlightNote");

      setTimeout(() => {
        card.classList.remove("highlightNote");
      }, 1200);
    }
  });
});

// Delete note modal
const deleteNoteModal = document.querySelector("#deleteNoteModal");
const deleteNoteModalMessage = document.querySelector(
  "#deleteNoteModalMessage",
);
const cancelDeleteNote = document.querySelector("#cancelDeleteNote");
const confirmDeleteNote = document.querySelector("#confirmDeleteNote");

let noteToDelete = null;

cancelDeleteNote.addEventListener("click", () => {
  deleteNoteModal.hidden = true;
  noteToDelete = null;
});

deleteNoteModal.addEventListener("click", (event) => {
  if (event.target === deleteNoteModal) {
    deleteNoteModal.hidden = true;
    noteToDelete = null;
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !deleteNoteModal.hidden) {
    deleteNoteModal.hidden = true;
    noteToDelete = null;
  }
});

confirmDeleteNote.addEventListener("click", async () => {
  if (!noteToDelete) return;

  const { noteId, deleteButton } = noteToDelete;

  confirmDeleteNote.disabled = true;
  confirmDeleteNote.innerHTML = `
  <span class="loadingSpinner"></span>
  Deleting...
`;

  try {
    const response = await fetch(`/notes/${noteId}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Could not delete the note.");
    }

    deleteNoteModal.hidden = true;
    noteToDelete = null;

    window.location.reload();
  } catch (error) {
    showToast(error.message, true);
    deleteButton.disabled = false;
  } finally {
    confirmDeleteNote.disabled = false;
    confirmDeleteNote.textContent = "Yes, Delete";
  }
});
notesList?.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest(".deleteNoteBtn");
  const pinButton = event.target.closest(".pinNoteBtn");
  const tagButton = event.target.closest(".noteTag");

  const card = event.target.closest(".noteCard");
  if (!card) return;

  // Clicking a tag should only filter notes.
  if (tagButton) return;

  // Clicking anywhere else on the note opens its editor.
  if (!deleteButton && !pinButton) {
    window.location.href = card.dataset.editUrl;
    return;
  }

  const noteId = card.dataset.noteId;

  if (deleteButton) {
    const noteTitle = card
      .querySelector(".noteTitleArea h2")
      .textContent.trim();

    noteToDelete = {
      noteId,
      deleteButton,
    };

    deleteNoteModalMessage.textContent = `Are you sure you want to permanently delete "${noteTitle}"?`;

    deleteNoteModal.hidden = false;

    cancelDeleteNote.focus();

    return;
  }

  if (pinButton) {
    const originalHTML = pinButton.innerHTML;

    pinButton.disabled = true;
    pinButton.innerHTML = `
    <span class="loadingSpinner"></span>
  `;

    try {
      const response = await fetch(`/notes/${noteId}/pin`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update the pin.");
      }

      window.location.reload();
    } catch (error) {
      showToast(error.message, true);
      pinButton.disabled = false;
      pinButton.innerHTML = originalHTML;
    }
  }
});

filterNotes();
