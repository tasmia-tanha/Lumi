
import { body, validationResult } from "express-validator";

export const calendarValidation = [
  body("title")
    .isString()
    .withMessage("Title must be text.")
    .bail()
    .trim()
    .isLength({ max: 30 })
    .withMessage("Title cannot exceed 30 characters."),

  body("pinned")
    .isBoolean({ strict: true })
    .withMessage("Pinned must be a boolean."),

  body("timeEntries")
    .isArray({ max: 20 })
    .withMessage("You can add a maximum of 20 time entries."),

  body("timeEntries.*.time")
    .isString()
    .withMessage("Time must be text.")
    .bail()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("Invalid time format."),

  body("timeEntries.*.description")
    .isString()
    .withMessage("Description must be text.")
    .bail()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Description must be between 1 and 100 characters."),
];

export function calendarValidatorHandler(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  next();
}
