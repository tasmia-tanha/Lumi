import express from "express";
import {getLogin,getForgotPassword,login,logout,resetPassword} from "../controllers/loginController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { loginValidation,loginValidatorHandler } from "../middlewares/login/loginValidator.js";
import { redirectLoggedInUser } from "../middlewares/common/checkLogin.js";
import { loginLimiter,passwordResetLimiter } from "../middlewares/rateLimiter.js";
import {
  recoveryValidation,
  recoveryValidatorHandler,
} from "../middlewares/user/recoveryValidator.js";

const router=express.Router();

router.get("/",decorateHtml("Login Page"),redirectLoggedInUser,getLogin);
router.get(
  "/forgot-password",
  decorateHtml("Forgot Password"),
  getForgotPassword,
);
router.post("/",loginLimiter,decorateHtml("Login Page"),loginValidation,loginValidatorHandler,login);
router.delete("/logout",logout);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  recoveryValidation,
  recoveryValidatorHandler,
  resetPassword,
);
export default router;

