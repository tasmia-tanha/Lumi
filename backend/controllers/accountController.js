import mongoose from "mongoose";
import { createHash, randomBytes } from "node:crypto";
import People from "../models/people.js";
import bcrypt from "bcrypt";

import { calendar } from "../models/calendarEvent.js";
import { CourseMaterial } from "../models/courseMaterialModel.js";
import { FocusSession } from "../models/focusSession.js";
import HabitCheckIn from "../models/habitCheckinModel.js";
import Habit from "../models/habitModel.js";
import { Lesson } from "../models/lessonModel.js";
import { Note } from "../models/note.js";
import { Subject } from "../models/subjectModel.js";
import task from "../models/task.js";

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
      user.password,
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
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

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

    const recoveryCode = randomBytes(32).toString("hex");

    user.recoveryCodeHash = createHash("sha256")
      .update(recoveryCode)
      .digest("hex");

    user.recoveryCodeCreatedAt = new Date();

    await user.save();

    return res.status(200).json({
      message: "Recovery code generated successfully.",
      recoveryCode,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAccount(req, res, next) {
  const session = await mongoose.startSession();

  try {
    const userId = req.user._id;
    const { currentPassword } = req.body;

    // Retrieve the user's password hash.
    const user = await People.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "Account not found.",
      });
    }

    // Verify the current password before deleting anything.
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isValidPassword) {
      return res.status(400).json({
        message: "Your current password is incorrect.",
      });
    }

    await session.withTransaction(async () => {
      await HabitCheckIn.deleteMany({ user: userId }).session(session);

      await Lesson.deleteMany({ user: userId }).session(session);
      await CourseMaterial.deleteMany({ user: userId }).session(session);

      await task.deleteMany({ user: userId }).session(session);
      await calendar.deleteMany({ user: userId }).session(session);
      await Note.deleteMany({ user: userId }).session(session);
      await FocusSession.deleteMany({ user: userId }).session(session);
      await Habit.deleteMany({ user: userId }).session(session);
      await Subject.deleteMany({ user: userId }).session(session);

      const result = await People.deleteOne({ _id: userId }).session(session);

      if (result.deletedCount !== 1) {
        throw new Error("Account could not be found or deleted.");
      }
    });

    res.clearCookie(process.env.COOKIE_NAME, {
      signed: true,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res.status(200).json({
      message: "Your account and all associated data have been deleted.",
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
}
