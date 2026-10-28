
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";

const editorElement = document.querySelector("#noteContent");
const contentInput = document.querySelector("#noteContentInput");
const noteForm = document.querySelector("#noteForm, .editNoteForm");

if (editorElement && contentInput && noteForm) {
  const editor = new Editor({
    element: editorElement,
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
    ],
    content: JSON.parse(
      document.querySelector("#initialNoteContent")?.textContent || '""',
    ),
    editorProps: {
      attributes: {
        class: "richTextContent",
        "aria-label": "Your note",
      },
    },
  });

  document.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", () => {
      const command = button.dataset.command;
      const chain = editor.chain().focus();

      switch (command) {
        case "bold":
          chain.toggleBold().run();
          break;
        case "italic":
          chain.toggleItalic().run();
          break;
        case "underline":
          chain.toggleUnderline().run();
          break;
        case "strike":
          chain.toggleStrike().run();
          break;
        case "bulletList":
          chain.toggleBulletList().run();
          break;
        case "orderedList":
          chain.toggleOrderedList().run();
          break;
        case "heading":
          chain.toggleHeading({ level: Number(button.dataset.level) }).run();
          break;
        case "highlight":
          chain.toggleHighlight({ color: "#f6e2a0" }).run();
          break;
        case "undo":
          chain.undo().run();
          break;
        case "redo":
          chain.redo().run();
          break;
      }
    });
  });

  const updateToolbar = () => {
    document.querySelectorAll("[data-command]").forEach((button) => {
      const command = button.dataset.command;
      let active = false;

      switch (command) {
        case "bold":
          active = editor.isActive("bold");
          break;
        case "italic":
          active = editor.isActive("italic");
          break;
        case "underline":
          active = editor.isActive("underline");
          break;
        case "strike":
          active = editor.isActive("strike");
          break;
        case "bulletList":
          active = editor.isActive("bulletList");
          break;
        case "orderedList":
          active = editor.isActive("orderedList");
          break;
        case "heading":
          active = editor.isActive("heading", {
            level: Number(button.dataset.level),
          });
          break;
        case "highlight":
          active = editor.isActive("highlight");
          break;
      }

      button.classList.toggle("isActive", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  editor.on("selectionUpdate", updateToolbar);
  editor.on("transaction", updateToolbar);
  updateToolbar();

  const noteId = noteForm.dataset.noteId;
const titleInput = document.querySelector("#noteTitle");
const tagsInput = document.querySelector("#noteTags");

let autoSaveTimer;

const autoSave = async () => {
  if (!noteId) return;

  const content = editor.getHTML();
  contentInput.value = content;

  try {
    const response = await fetch(`/notes/${noteId}/autosave`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: titleInput.value,
        content,
        tags: tagsInput.value,
      }),
    });

    if (!response.ok) {
      console.error("Auto-save failed");
    }
  } catch (error) {
    console.error("Auto-save error:", error);
  }
};

const scheduleAutoSave = () => {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(autoSave, 1000);
};

editor.on("update", scheduleAutoSave);
titleInput?.addEventListener("input", scheduleAutoSave);
tagsInput?.addEventListener("input", scheduleAutoSave);
  noteForm.addEventListener("submit", (event) => {
    contentInput.value = editor.getHTML();

    if (!editor.getText().trim()) {
      event.preventDefault();
      alert("Please write something in your note.");
    }
  });
}
