import express from "express";
import {getCalendar} from "../controllers/calendarController.js";
const router=express.Router();

router.get("/",getCalendar);

export default router;