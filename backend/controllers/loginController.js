import people from "../models/people.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
export function getLogin(req, res, next) {
  res.render("login");
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
      throw new Error("Please enter a valid email address!");
    }
    const user = await people
      .findOne({
        email: username.toLowerCase().trim(),
      })
      .select("+password");

    if (user) {
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (isValidPassword) {
        const userObj = {
          _id: user._id,
          name: user.name,
          email: user.email,
        };

        const token = jwt.sign(userObj, process.env.JWT_SECRET, {
          
          expiresIn: Number(process.env.JWT_EXPIRES),
        });

        res.cookie(process.env.COOKIE_NAME, token, {
          maxAge: Number(process.env.JWT_EXPIRES) * 1000,
          httpOnly: true,
          signed: true,
          secure: process.env.NODE_ENV === "production",
        });

        res.locals.loggedinUser = userObj;

        res.redirect("/dashboard");
      } else {
        throw new Error("Invalid email or password.");
      }
    } else {
      throw new Error("Invalid email or password.");
    }
  } catch (error) {
    console.log("LOGIN ERROR:", error.message);
    res.render("login", {
      data: {
        username: req.body.username,
      },
      errors: {
        common: {
          msg: error.message,
        },
      },
    });
  }
}

export function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME, {
    signed: true,
    httpOnly: true,
  });
  return res.status(200).json({ message: "Logged out successfully" });
}
