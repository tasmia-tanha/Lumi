import express from "express";
import {getFocusSession,saveFocusSession,getTotalStudyTime} from "../controllers/sessionController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
const router=express.Router();

router.get("/total", authGuard, getTotalStudyTime);
router.get("/",decorateHtml("Focus Session"),authGuard,getFocusSession);
router.post("/",authGuard,saveFocusSession);

export default router;