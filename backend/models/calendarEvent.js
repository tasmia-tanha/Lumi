import mongoose from "mongoose";

const calendarSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "People",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    title: {
      type: String,
      maxlength: 30,
      trim: true,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    timeEntries: {
      type: [
        {
          time: {
            type: String,
            trim: true,
            maxlength: 20,
          },
          description: {
            type: String,
            trim: true,
            maxlength: 100,
          },
        },
      ],
      validate: {
        validator: (entries) => entries.length <= 20,
        message: "You can add a maximum of 20 time entries.",
      },
    },
  },
  {
    timestamps: true,
  },
);
calendarSchema.index({ user: 1, date: 1 }, { unique: true });
export const calendar = mongoose.model("Calendar", calendarSchema);
