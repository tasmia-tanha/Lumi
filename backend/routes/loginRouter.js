import express from "express";
import {getLogin,login} from "../controllers/loginController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { loginValidation,loginValidatorHandler } from "../middlewares/login/loginValidator.js";
const router=express.Router();

router.get("/",decorateHtml("Login Page"),getLogin);
router.post("/",decorateHtml("Login Page"),loginValidation,loginValidatorHandler,login);

export default router;

