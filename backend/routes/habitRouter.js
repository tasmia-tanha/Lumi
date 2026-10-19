import express from "express";
import {getHabits} from "../controllers/habitController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
const router=express.Router();

router.get("/",decorateHtml("Daily Habits"),getHabits);

export default router;