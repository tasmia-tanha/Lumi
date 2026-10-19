import express from "express";
import {getHabits} from "../controllers/habitController.js";
const router=express.Router();

router.get("/",getHabits);

export default router;