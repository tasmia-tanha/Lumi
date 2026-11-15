
import { check, validationResult } from "express-validator";

export const recoveryValidation = [
  check("email")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address."),

  check("recoveryCode")
    .trim()
    .matches(/^[a-fA-F0-9]{64}$/)
    .withMessage("Please enter a valid recovery code."),

  check("newPassword")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be at least 8 characters and contain an uppercase letter, lowercase letter, number and symbol."
    ),

  check("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your new password"),

  check("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
];

export function recoveryValidatorHandler(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.mapped(),
    });
  }

  next();
}
