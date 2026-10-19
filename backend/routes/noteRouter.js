import express from "express";
import {getNotes} from "../controllers/noteController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
const router=express.Router();

router.get("/",decorateHtml("Notes"),getNotes);

export default router;