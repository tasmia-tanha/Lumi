
import express from "express";

import {
  getFocusSession,
  saveFocusSession,
  getTotalStudyTime,
  updateDailyGoal,
  getWeeklyStudyTime
} from "../controllers/sessionController.js";

import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";

const router = express.Router();

router.get(
  "/",
  decorateHtml("Focus Session"),
  authGuard,
  getFocusSession,
);

router.get("/total", authGuard, getTotalStudyTime);
router.get("/weekly", authGuard, getWeeklyStudyTime);

router.post("/", authGuard, saveFocusSession);

router.patch("/goal", authGuard, updateDailyGoal);

export default router;
