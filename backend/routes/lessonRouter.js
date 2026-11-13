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
import {
  subjectValidation,
  lessonValidation,
  lessonUpdateValidation,
  materialValidation,
  lessonIdValidation,
  materialIdValidation,
  lessonValidatorHandler,
} from "../middlewares/validators/lessonValidator.js";
const router = express.Router();

router.get("/", authGuard, getLessons);

router.post(
  "/subjects",
  authGuard,
  subjectValidation,
  lessonValidatorHandler,
  addSubject,
);

router.post(
  "/lessons",
  authGuard,
  lessonValidation,
  lessonValidatorHandler,
  addLesson,
);

router.patch(
  "/lessons/:id",
  authGuard,
  lessonIdValidation,
  lessonUpdateValidation,
  lessonValidatorHandler,
  toggleLesson,
);

router.post(
  "/materials",
  authGuard,
  materialValidation,
  lessonValidatorHandler,
  addCourseMaterial,
);

router.delete(
  "/lessons/:id",
  authGuard,
  lessonIdValidation,
  lessonValidatorHandler,
  deleteLesson,
);

router.delete(
  "/materials/:id",
  authGuard,
  materialIdValidation,
  lessonValidatorHandler,
  deleteCourseMaterial,
);

export default router;