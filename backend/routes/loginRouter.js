import express from "express";
import {getLogin,login,logout} from "../controllers/loginController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { loginValidation,loginValidatorHandler } from "../middlewares/login/loginValidator.js";
import { redirectLoggedInUser } from "../middlewares/common/checkLogin.js";
import { loginLimiter } from "../middlewares/rateLimiter.js";
const router=express.Router();

router.get("/",decorateHtml("Login Page"),redirectLoggedInUser,getLogin);
router.post("/",loginLimiter,decorateHtml("Login Page"),loginValidation,loginValidatorHandler,login);
router.delete("/logout",logout);

export default router;

