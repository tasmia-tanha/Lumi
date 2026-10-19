import express from "express";
import {getLogin} from "../controllers/loginController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
const router=express.Router();

router.get("/",decorateHtml("Login Page"),getLogin);

export default router;

