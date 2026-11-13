import { body, param, validationResult } from "express-validator";

export const subjectValidation = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Subject name must be between 1 and 20 characters."),
];

export const lessonValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Lesson title must be between 1 and 30 characters."),

  body("subjectId").isMongoId().withMessage("Invalid subject."),
];

export const lessonUpdateValidation = [
  body("status")
    .isIn(["inProgress", "completed"])
    .withMessage("Invalid lesson status."),
];

export const materialValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage("Material title must be between 1 and 20 characters."),

  body("url")
    .isString()
    .withMessage("URL must be a string.")
    .bail()
    .trim()
    .isLength({ min: 1, max: 2048 })
    .withMessage("URL must be between 1 and 2048 characters.")
    .bail()
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Please enter a valid HTTP or HTTPS URL."),

  body("subjectId").isMongoId().withMessage("Invalid subject."),
];

export const lessonIdValidation = [
  param("id").isMongoId().withMessage("Invalid lesson ID."),
];

export const materialIdValidation = [
  param("id").isMongoId().withMessage("Invalid material ID."),
];

export function lessonValidatorHandler(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  next();
}
