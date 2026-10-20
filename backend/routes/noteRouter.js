import express from "express";
import {getNotes} from "../controllers/noteController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
const router=express.Router();

router.get("/",decorateHtml("Notes"),authGuard,getNotes);

export default router;