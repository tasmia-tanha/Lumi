import { createHash, randomBytes } from "node:crypto";
import People from "../models/people.js";
import bcrypt from "bcrypt";

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find the logged-in user and retrieve their password hash.
    const user = await People.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        errors: {
          common: {
            msg: "Account not found.",
          },
        },
      });
    }

    // Verify the current password.
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isValidPassword) {
      return res.status(400).json({
        errors: {
          currentPassword: {
            msg: "Your current password is incorrect.",
          },
        },
      });
    }

    // Prevent reusing the current password.
    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (isSamePassword) {
      return res.status(400).json({
        errors: {
          newPassword: {
            msg: "Your new password must be different from your current password.",
          },
        },
      });
    }

    // Hash and update the new password.
    user.password = await bcrypt.hash(newPassword, 10);

    // Invalidate all previously issued JWTs.
    user.tokenVersion = (user.tokenVersion ?? 0) + 1;

    await user.save();

    // Log the user out by clearing the authentication cookie.
    res.clearCookie(process.env.COOKIE_NAME, {
      signed: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res.status(200).json({
      message: "Password changed successfully. Please log in again.",
    });

  } catch (error) {
    next(error);
  }
}


export async function generateRecoveryCode(req, res, next) {
  try {
    const user = await People.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    // Generate a cryptographically secure 32-byte recovery code.
    const recoveryCode = randomBytes(32).toString("hex");

    // Store only the SHA-256 hash, never the original code.
    user.recoveryCodeHash = createHash("sha256")
      .update(recoveryCode)
      .digest("hex");

    user.recoveryCodeCreatedAt = new Date();

    await user.save();

    // Return the original code only once.
    return res.status(200).json({
      message: "Recovery code generated successfully.",
      recoveryCode,
    });

  } catch (error) {
    next(error);
  }
}