import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["inProgress", "completed"],
      default: "inProgress",
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "People",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Lesson = mongoose.model("Lesson", lessonSchema);