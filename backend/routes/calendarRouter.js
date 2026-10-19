import express from "express";
import {getCalendar} from "../controllers/calendarController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
const router=express.Router();

router.get("/",decorateHtml("Calendar"),getCalendar);

export default router;