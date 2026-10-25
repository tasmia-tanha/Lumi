import mongoose from "mongoose";

const habitCheckInSchema = new mongoose.Schema(
  {
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "People",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

habitCheckInSchema.index(
  { habit: 1, date: 1 },
  { unique: true },
);

const HabitCheckIn = mongoose.model(
  "HabitCheckIn",
  habitCheckInSchema,
);

export default HabitCheckIn;