import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20000,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
    validator: (tags) => tags.length <= 10,
    message: "A note can have a maximum of 10 tags.",
  },
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "People",
      required: true,
    },
  },
  { timestamps: true }
);

export const Note = mongoose.model("Note", noteSchema);