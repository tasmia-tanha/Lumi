import { body, param, validationResult } from "express-validator";

export const noteValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 150 })
    .withMessage("Title must be between 1 and 150 characters."),

  body("content")
    .trim()
    .isLength({ min: 1, max: 20000 })
    .withMessage("Note content must be between 1 and 20000 characters."),
];

export const noteTagsValidation = [
  body("tags")
    .optional()
    .custom((tags) => {
      if (typeof tags !== "string" && !Array.isArray(tags)) {
        return false;
      }

      const tagList = Array.isArray(tags) ? tags : tags.split(",");

      return (
        tagList.length <= 10 &&
        tagList.every(
          (tag) =>
            typeof tag === "string" &&
            tag.trim().replace(/^#/, "").length <= 30,
        )
      );
    })
    .withMessage(
      "You can add up to 10 tags, each with a maximum of 30 characters.",
    ),
];

export function noteValidatorHandler(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.mapped() });
  }

  next();
}
export const noteIdValidation = [
  param("id").isMongoId().withMessage("Invalid note ID."),
];
