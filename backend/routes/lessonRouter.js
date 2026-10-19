import express from "express";
import {getLessons} from "../controllers/lessonController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
const router=express.Router();

router.get("/",decorateHtml("Lessons & Materials"),getLessons);

export default router;