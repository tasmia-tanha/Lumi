
import { body, validationResult } from "express-validator";

export const focusSessionValidation = [
  body("duration")
    .isFloat({ min: 1000, max: 86400000 })
    .withMessage("Study duration must be between 1 second and 24 hours."),

  body("mode")
    .optional()
    .isIn(["free", "pomodoro"])
    .withMessage("Invalid focus session mode."),
];

export const dailyGoalValidation = [
  body("hours")
    .isInt({ min: 0, max: 24 })
    .withMessage("Hours must be between 0 and 24."),

  body("minutes")
    .isInt({ min: 0, max: 59 })
    .withMessage("Minutes must be between 0 and 59."),

  body()
    .custom((value) => {
      const hours = Number(value.hours);
      const minutes = Number(value.minutes);
      const total = hours * 60 + minutes;

      return total >= 1 && total <= 1440;
    })
    .withMessage("Choose a goal between 1 minute and 24 hours."),
];

export function focusSessionValidatorHandler(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  next();
}
