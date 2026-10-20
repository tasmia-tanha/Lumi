import express from "express";
import {getCalendar} from "../controllers/calendarController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
const router=express.Router();

router.get("/",decorateHtml("Calendar"),authGuard,getCalendar);

export default router;