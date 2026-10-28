import mongoose from "mongoose";
import { Note } from "../models/note.js";
import sanitizeHtml from "sanitize-html";

export async function getNotes(req, res, next) {
  try {
    const notes = await Note.find({ user: req.user._id })
      .sort({ pinned: -1, updatedAt: -1 })
      .lean();

    const notesWithPlainText = notes.map((note) => ({
      ...note,
      plainText: sanitizeHtml(note.content, {
        allowedTags: [],
        allowedAttributes: {},
      }),
    }));

    const tags = [...new Set(notes.flatMap((note) => note.tags || []))].sort(
      (a, b) => a.localeCompare(b),
    );

    res.render("notes", {
      notes: notesWithPlainText,
      tags,
    });
  } catch (error) {
    next(error);
  }
}

export function getNewNote(req, res) {
  res.render("newNote", {
    title: "New Note",
    errors: {},
    note: {},
  });
}

export async function createNote(req, res, next) {
  try {
    const { title, content, tags } = req.body;

    const cleanedTitle = title?.trim();
    const cleanedContent = sanitizeHtml(content || "", {
      allowedTags: [
        "p",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "u",
        "s",
        "ul",
        "ol",
        "li",
        "h1",
        "h2",
        "h3",
        "blockquote",
        "pre",
        "code",
        "mark",
      ],
      allowedAttributes: {},
    }).trim();

    if (!cleanedTitle || !cleanedContent) {
      return res.status(400).render("newNote", {
        title: "New Note",
        errors: {
          message: "Please enter both a title and note content.",
        },
        note: { title, content, tags },
      });
    }

    const cleanedTags = [
      ...new Set(
        (Array.isArray(tags) ? tags : (tags || "").split(","))
          .map((tag) => tag.trim().replace(/^#/, ""))
          .filter(Boolean)
          .map((tag) => tag.slice(0, 30)),
      ),
    ];

    await Note.create({
      title: cleanedTitle,
      content: cleanedContent,
      tags: cleanedTags,
      user: req.user._id,
    });

    res.redirect("/notes");
  } catch (error) {
    next(error);
  }
}

export async function deleteNote(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid note ID." });
    }

    const deletedNote = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deletedNote) {
      return res.status(404).json({ message: "Note not found." });
    }

    return res.json({ message: "Note deleted successfully." });
  } catch (error) {
    next(error);
  }
}

export async function togglePinNote(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid note ID." });
    }

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found." });
    }

    note.pinned = !note.pinned;
    await note.save();

    return res.json({
      message: note.pinned ? "Note pinned." : "Note unpinned.",
      pinned: note.pinned,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEditNote(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid note ID.");
    }

    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();

    if (!note) {
      return res.status(404).send("Note not found.");
    }

    res.render("editNote", {
      title: "Edit Note",
      errors: {},
      note,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateNote(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid note ID.");
    }

    const { title, content, tags } = req.body;

    const cleanedTitle = title?.trim();
    const cleanedContent = sanitizeHtml(content || "", {
      allowedTags: [
        "p",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "u",
        "s",
        "ul",
        "ol",
        "li",
        "h1",
        "h2",
        "h3",
        "blockquote",
        "pre",
        "code",
        "mark",
      ],
      allowedAttributes: {},
    }).trim();

    if (!cleanedTitle || !cleanedContent) {
      return res.status(400).send("Title and content are required.");
    }

    const cleanedTags = [
      ...new Set(
        (Array.isArray(tags) ? tags : (tags || "").split(","))
          .map((tag) => tag.trim().replace(/^#/, ""))
          .filter(Boolean)
          .map((tag) => tag.slice(0, 30)),
      ),
    ];

    const updatedNote = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      {
        title: cleanedTitle,
        content: cleanedContent,
        tags: cleanedTags,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!updatedNote) {
      return res.status(404).send("Note not found.");
    }

    res.redirect("/notes");
  } catch (error) {
    next(error);
  }
}
