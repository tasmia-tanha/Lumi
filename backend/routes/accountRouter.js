import express from "express";

import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";

import {
  changePassword,
  generateRecoveryCode,
  deleteAccount,
} from "../controllers/accountController.js";

import {
  changePasswordValidation,
  changePasswordValidatorHandler,
  deleteAccountValidation,
  deleteAccountValidatorHandler,
} from "../middlewares/user/passwordValidator.js";

import { changePasswordLimiter ,recoveryCodeLimiter,deleteAccountLimiter} from "../middlewares/rateLimiter.js";

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

router.post(
  "/generate-recovery-code",
  authGuard,
  recoveryCodeLimiter,
  generateRecoveryCode,
);

router.delete(
  "/delete-account",
  authGuard,
  deleteAccountLimiter,
  deleteAccountValidation,
  deleteAccountValidatorHandler,
  deleteAccount,
);
export default router;
