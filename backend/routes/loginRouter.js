import express from "express";
import {getLogin} from "../controllers/loginController.js";
const router=express.Router();

router.get("/",getLogin);

export default router;

