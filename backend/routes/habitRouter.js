import express from "express";

import {
  getHabits,
  addHabit,
  deleteHabit,
  toggleHabitCheckIn,
  getHabitStats
} from "../controllers/habitController.js";

import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
import {
  habitIdValidation,
  habitValidatorHandler,
} from "../middlewares/validators/habitValidator.js";
const router = express.Router();


router.get(
  "/",
  decorateHtml("Daily Habits"),
  authGuard,
  getHabits,
);

router.get("/stats", authGuard, getHabitStats);
router.post(
  "/",
  authGuard,
  addHabit,
);


router.delete(
  "/:id",
  authGuard,
  habitIdValidation,
  habitValidatorHandler,
  deleteHabit,
);


router.patch(
  "/:id/check-in",
  authGuard,
  habitIdValidation,
  habitValidatorHandler,
  toggleHabitCheckIn,
);

export default router;