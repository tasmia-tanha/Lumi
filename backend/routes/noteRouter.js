import express from "express";
import {getNotes} from "../controllers/noteController.js";
const router=express.Router();

router.get("/",getNotes);

export default router;