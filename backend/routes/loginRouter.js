import express from "express";
import {getLogin,login,logout} from "../controllers/loginController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { loginValidation,loginValidatorHandler } from "../middlewares/login/loginValidator.js";
import { redirectLoggedInUser } from "../middlewares/common/checkLogin.js";
const router=express.Router();

router.get("/",decorateHtml("Login Page"),redirectLoggedInUser,getLogin);
router.post("/",decorateHtml("Login Page"),loginValidation,loginValidatorHandler,login);
router.delete("/logout",logout);

export default router;

