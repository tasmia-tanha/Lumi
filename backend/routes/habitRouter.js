import express from "express";
import {getHabits} from "../controllers/habitController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
const router=express.Router();

router.get("/",decorateHtml("Daily Habits"),authGuard,getHabits);

export default router;