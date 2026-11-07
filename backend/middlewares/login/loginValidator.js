import { check, validationResult } from "express-validator";
export const loginValidation = [
  check("username")
    .trim()
    .isEmail()
    .withMessage("Please enter a valid email address."),

  check("password")
    .isLength({ min: 1 })
    .withMessage("Password is required"),
];

export const loginValidatorHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();

  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.render("login", {
      data: {
        username: req.body.username,
      },
      errors: mappedErrors,
    });
  }
};
