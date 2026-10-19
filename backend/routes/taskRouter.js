import express from "express";
import {getTasks} from "../controllers/taskController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
const router=express.Router();

router.get("/",decorateHtml("Tasks"),getTasks);

export default router;