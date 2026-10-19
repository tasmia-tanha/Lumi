import express from "express";
import {getFocusSession} from "../controllers/focusController.js";
const router=express.Router();

router.get("/",getFocusSession);

export default router;