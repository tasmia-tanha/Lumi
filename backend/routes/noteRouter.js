import express from "express";
import {
  getNotes,
  getNewNote,
  createNote,
  deleteNote,
  togglePinNote,
  getEditNote,
  updateNote
} from "../controllers/noteController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";

const router = express.Router();

router.get("/", decorateHtml("Notes"), authGuard, getNotes);

router.get("/new", decorateHtml("New Note"), authGuard, getNewNote);

router.get("/:id/edit", decorateHtml("Edit Note"), authGuard, getEditNote);

router.post("/", authGuard, createNote);

router.post("/:id", authGuard, updateNote);

router.delete("/:id", authGuard, deleteNote);

router.patch("/:id/pin", authGuard, togglePinNote);

export default router;