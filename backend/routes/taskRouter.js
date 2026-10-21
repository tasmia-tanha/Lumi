import express from "express";
import {addTasks,getTasks,updateTasks} from "../controllers/taskController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
const router=express.Router();


router.get("/",decorateHtml("Tasks"),authGuard,getTasks);
router.post("/",decorateHtml("Tasks"),authGuard,addTasks);
router.patch("/:id",decorateHtml("Tasks"),authGuard,updateTasks)
export default router;