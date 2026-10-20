import express from "express";
import {getFocusSession} from "../controllers/focusController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
const router=express.Router();

router.get("/",decorateHtml("Focus Session"),authGuard,getFocusSession);

export default router;