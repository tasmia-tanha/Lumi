import { createHash } from "node:crypto";
import people from "../models/people.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
export function getLogin(req, res, next) {
  res.render("login");
}
export function getForgotPassword(req, res, next) {
  res.render("forgotPassword");
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
          tokenVersion: user.tokenVersion ?? 0,
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


export async function resetPassword(req, res, next) {
  try {
    const { email, recoveryCode, newPassword } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    
    const user = await people
      .findOne({ email: normalizedEmail })
      .select("+password +recoveryCodeHash");

    
    if (!user || !user.recoveryCodeHash) {
      return res.status(400).json({
        message: "Invalid email or recovery code.",
      });
    }

    
    const submittedHash = createHash("sha256")
      .update(recoveryCode.trim())
      .digest("hex");

    
    const storedBuffer = Buffer.from(user.recoveryCodeHash, "hex");
    const submittedBuffer = Buffer.from(submittedHash, "hex");

    const { timingSafeEqual } = await import("node:crypto");

    if (
      storedBuffer.length !== submittedBuffer.length ||
      !timingSafeEqual(storedBuffer, submittedBuffer)
    ) {
      return res.status(400).json({
        message: "Invalid email or recovery code.",
      });
    }

    
    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        message: "Your new password must be different from your current password.",
      });
    }

    
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    
    const result = await people.updateOne(
      {
        _id: user._id,
        recoveryCodeHash: user.recoveryCodeHash,
      },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          recoveryCodeHash: 1,
          recoveryCodeCreatedAt: 1,
        },
        $inc: {
          tokenVersion: 1,
        },
      }
    );

    if (result.modifiedCount !== 1) {
      return res.status(400).json({
        message: "Invalid email or recovery code.",
      });
    }

    return res.status(200).json({
      message: "Password reset successfully. Please log in.",
    });

  } catch (error) {
    next(error);
  }
}
