import express from "express";
import {getFocusSession} from "../controllers/focusController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
const router=express.Router();

router.get("/",decorateHtml("Focus Session"),getFocusSession);

export default router;