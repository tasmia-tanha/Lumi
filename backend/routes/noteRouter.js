import express from "express";
import {
  getNotes,
  getNewNote,
  createNote,
  deleteNote,
  togglePinNote,
  getEditNote,
  updateNote,
  autoSaveNote
} from "../controllers/noteController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
import {
  noteValidation,
  noteTagsValidation,
  noteValidatorHandler,
  noteIdValidation,
} from "../middlewares/validators/noteValidator.js";
const router = express.Router();

router.get("/", decorateHtml("Notes"), authGuard, getNotes);

router.get("/new", decorateHtml("New Note"), authGuard, getNewNote);

router.get(
  "/:id/edit",
  decorateHtml("Edit Note"),
  authGuard,
  noteIdValidation,
  noteValidatorHandler,
  getEditNote
);

router.post(
  "/",
  authGuard,
  noteValidation,
  noteTagsValidation,
  noteValidatorHandler,
  createNote
);

router.post(
  "/:id",
  authGuard,
  noteIdValidation,
  noteValidation,
  noteTagsValidation,
  noteValidatorHandler,
  updateNote
);

router.patch(
  "/:id/autosave",
  authGuard,
  noteIdValidation,
  noteValidation,
  noteTagsValidation,
  noteValidatorHandler,
  autoSaveNote
);

router.delete(
  "/:id",
  authGuard,
  noteIdValidation,
  noteValidatorHandler,
  deleteNote
);

router.patch(
  "/:id/pin",
  authGuard,
  noteIdValidation,
  noteValidatorHandler,
  togglePinNote
);

export default router;