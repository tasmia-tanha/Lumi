import express from "express";

import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";

import { changePassword } from "../controllers/accountController.js";

import {
  changePasswordValidation,
  changePasswordValidatorHandler,
} from "../middlewares/user/passwordValidator.js";

import { changePasswordLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get("/", decorateHtml("Account"), authGuard, (req, res) => {
  res.render("account");
});

router.post(
  "/change-password",
  authGuard,
  changePasswordLimiter,
  changePasswordValidation,
  changePasswordValidatorHandler,
  changePassword,
);

export default router;
