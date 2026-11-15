import mongoose from "mongoose";

const peopleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },

    recoveryCodeHash: {
      type: String,
      select: false,
      default: undefined,
    },

    recoveryCodeCreatedAt: {
      type: Date,
      select: false,
      default: undefined,
    },
    dailyGoalMinutes: {
      type: Number,
      default: 120,
      min: 1,
      max: 1440,
    },
  },
  {
    timestamps: true,
  },
);

const People = mongoose.model("People", peopleSchema);

export default People;
