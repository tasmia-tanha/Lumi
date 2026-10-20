import express from "express";
import {getTasks} from "../controllers/taskController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
const router=express.Router();

router.get("/",decorateHtml("Tasks"),authGuard,getTasks);

export default router;