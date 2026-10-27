
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";

const editorElement = document.querySelector("#noteContent");
const contentInput = document.querySelector("#noteContentInput");
const noteForm = document.querySelector("#noteForm");

if (editorElement && contentInput && noteForm) {
  const editor = new Editor({
    element: editorElement,
    extensions: [
      StarterKit,
      Underline,
      Highlight,
    ],
    content: "",
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
        case "undo":
          chain.undo().run();
          break;
        case "redo":
          chain.redo().run();
          break;
      }
    });
  });

  noteForm.addEventListener("submit", (event) => {
    contentInput.value = editor.getHTML();

    if (!editor.getText().trim()) {
      event.preventDefault();
      alert("Please write something in your note.");
    }
  });
}
