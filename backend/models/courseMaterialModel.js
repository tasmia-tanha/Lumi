import mongoose from "mongoose";

const courseMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
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

export const CourseMaterial = mongoose.model(
  "CourseMaterial",
  courseMaterialSchema
);