import express from "express";
import {getDashboard} from "../controllers/dashboardController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
const router=express.Router();

router.get("/",decorateHtml("Dashboard"),getDashboard);

export default router;