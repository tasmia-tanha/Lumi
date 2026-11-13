import express from "express";
import {
  getCalendar,
  getCalendarDate,
  saveCalendarDate,
  getCalendarDateDetails,
  getPinnedDates,
  getUpcomingEvents,
  getTodayAgenda,
  getDashboardDeadlines,
} from "../controllers/calendarController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
import {
  calendarValidation,
  calendarValidatorHandler,
} from "../middlewares/validators/calendarValidator.js";
const router = express.Router();

router.get("/", decorateHtml("Calendar"), authGuard, getCalendar);
router.get("/pinned", authGuard, getPinnedDates);
router.get("/upcoming", authGuard, getUpcomingEvents);
router.get("/today-agenda", authGuard, getTodayAgenda);
router.get("/dashboard-deadlines", authGuard, getDashboardDeadlines);
router.get("/:date", decorateHtml("Calendar"), authGuard, getCalendarDate);

router.post(
  "/:date",
  authGuard,
  calendarValidation,
  calendarValidatorHandler,
  saveCalendarDate,
);
router.get("/:date/details", authGuard, getCalendarDateDetails);

export default router;
