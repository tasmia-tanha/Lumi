import { body,param, validationResult } from "express-validator";

export const taskValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Task title must be between 1 and 100 characters."),

  body("priority")
    .optional()
    .isIn(["high", "medium", "low"])
    .withMessage("Invalid task priority."),
];

export const taskUpdateValidation = [
  body("completed")
    .custom((value) => typeof value === "boolean")
    .withMessage("Completed must be true or false."),
];


export const taskIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Invalid task ID."),
];


export function taskValidatorHandler(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  next();
}


