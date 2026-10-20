import express from "express";
import {getLessons} from "../controllers/lessonController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
const router=express.Router();

router.get("/",decorateHtml("Lessons & Materials"),authGuard,getLessons);

export default router;