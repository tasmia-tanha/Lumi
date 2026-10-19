import express from "express";
import {getSignUp} from "../controllers/signUpController.js";
const router=express.Router();

router.get("/",getSignUp);

export default router;