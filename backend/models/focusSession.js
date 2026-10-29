
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "People",
      required: true,
      index: true,
    },

    
    duration: {
      type: Number,
      required: true,
      min: 1,
    },

    mode: {
      type: String,
      enum: ["free", "pomodoro", "deep"],
      default: "free",
    },
  },
  {
    timestamps: true,
  },
);

export const FocusSession = mongoose.model("Session", sessionSchema);

