import bcrypt from "bcrypt";
import people from "../models/people.js";
export function getSignUp(req, res, next) {
  res.render("signup");
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        errors: {
          confirmPassword: {
            msg: "Password doesn't match",
          },
        },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await people.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
    message: "User registered successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errors: {
        common: {
          msg: "unknown error occured",
        },
      },
    });
  }
}
