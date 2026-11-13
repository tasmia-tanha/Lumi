import { param, validationResult } from "express-validator";

export const habitIdValidation = [
  param("id").isMongoId().withMessage("Invalid habit ID."),
];

export function habitValidatorHandler(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  next();
}