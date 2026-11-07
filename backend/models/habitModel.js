import mongoose from "mongoose";

const habitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "People",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Habit = mongoose.model("Habit", habitSchema);

export default Habit;