import express from "express";
import {getDashboard,getTasksAsJson} from "../controllers/dashboardController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
const router=express.Router();

router.get("/",decorateHtml("Dashboard"),authGuard,getDashboard);

router.get("/tasks-data",authGuard,getTasksAsJson);

export default router;