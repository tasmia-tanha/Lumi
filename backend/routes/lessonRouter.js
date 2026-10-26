import express from "express";
import {authGuard} from "../middlewares/common/checkLogin.js";
import {
  getLessons,
  addSubject,
  addLesson,
  toggleLesson,
  addCourseMaterial,
  deleteCourseMaterial,
  deleteLesson
} from "../controllers/lessonController.js";

const router = express.Router();

router.get("/", authGuard, getLessons);

router.post("/subjects", authGuard, addSubject);

router.post("/lessons", authGuard, addLesson);

router.patch("/lessons/:id", authGuard, toggleLesson);

router.post("/materials", authGuard, addCourseMaterial);

router.delete("/lessons/:id", authGuard, deleteLesson);

router.delete("/materials/:id", authGuard, deleteCourseMaterial);

export default router;