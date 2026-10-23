import express from "express";
import {
  getCalendar,
  getCalendarDate,
  saveCalendarDate,
  getCalendarDateDetails,
  getPinnedDates,
  getUpcomingEvents,
  getTodayAgenda,
} from "../controllers/calendarController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
const router = express.Router();

router.get("/", decorateHtml("Calendar"), authGuard, getCalendar);
router.get("/pinned", authGuard, getPinnedDates);
router.get("/upcoming", authGuard, getUpcomingEvents);
router.get("/today-agenda", authGuard, getTodayAgenda);
router.get("/:date", decorateHtml("Calendar"), authGuard, getCalendarDate);
router.post("/:date", authGuard, saveCalendarDate);
router.get("/:date/details", authGuard, getCalendarDateDetails);

export default router;
