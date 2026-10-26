import mongoose from "mongoose";
import { Subject } from "../models/subjectModel.js";
import { Lesson } from "../models/lessonModel.js";
import { CourseMaterial } from "../models/courseMaterialModel.js";

export async function getLessons(req, res, next) {
  try {
    const userId = req.user._id;

    const subjects = await Subject.find({ user: userId })
      .sort({ name: 1 })
      .lean();

    const lessons = await Lesson.find({ user: userId })
      .populate("subject", "name")
      .sort({ createdAt: -1 })
      .lean();

    const materials = await CourseMaterial.find({ user: userId })
      .populate("subject", "name")
      .sort({ createdAt: -1 })
      .lean();

    const completedCount = lessons.filter(
      (lesson) => lesson.status === "completed"
    ).length;

    const progress =
      lessons.length === 0
        ? 0
        : Math.round((completedCount / lessons.length) * 100);

    res.render("lessons", {
      subjects,
      lessons,
      materials,
      completedCount,
      progress,
    });
  } catch (error) {
    next(error);
  }
}

export async function addSubject(req, res, next) {
  try {
    const name = req.body.name?.trim();

    if (!name) {
      return res.status(400).json({
        message: "Please enter a subject name.",
      });
    }

    const existingSubject = await Subject.findOne({
      user: req.user._id,
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    });

    if (existingSubject) {
      return res.status(409).json({
        message: "This subject already exists.",
      });
    }

    const subject = await Subject.create({
      name,
      user: req.user._id,
    });

    res.status(201).json({
      message: "Subject added successfully!",
      subject,
    });
  } catch (error) {
    next(error);
  }
}

export async function addLesson(req, res, next) {
  try {
    const title = req.body.title?.trim();
    const { subjectId } = req.body;

    if (!title || !subjectId) {
      return res.status(400).json({
        message: "Enter a lesson title and select a subject.",
      });
    }

    if (!mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({
        message: "Invalid subject.",
      });
    }

    const subject = await Subject.findOne({
      _id: subjectId,
      user: req.user._id,
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found.",
      });
    }

    const lesson = await Lesson.create({
      title,
      subject: subject._id,
      user: req.user._id,
      status: "inProgress",
    });

    res.status(201).json({
      message: "Lesson added successfully!",
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        status: lesson.status,
        subject: {
          _id: subject._id,
          name: subject.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleLesson(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid lesson.",
      });
    }

    if (!["inProgress", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid lesson status.",
      });
    }

    const lesson = await Lesson.findOneAndUpdate(
      {
        _id: id,
        user: req.user._id,
      },
      { status },
      { returnDocument:"after", runValidators: true }
    );

    if (!lesson) {
      return res.status(404).json({
        message: "Lesson not found.",
      });
    }

    res.json({
      message: "Lesson updated successfully!",
      lesson,
    });
  } catch (error) {
    next(error);
  }
}

export async function addCourseMaterial(req, res, next) {
  try {
    const title = req.body.title?.trim();
    const url = req.body.url?.trim();
    const { subjectId } = req.body;

    if (!title || !url || !subjectId) {
      return res.status(400).json({
        message: "Enter a title, URL, and select a subject.",
      });
    }

    if (!mongoose.isValidObjectId(subjectId)) {
      return res.status(400).json({
        message: "Invalid subject.",
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(url);
    } catch {
      return res.status(400).json({
        message: "Please enter a valid URL.",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        message: "Only HTTP and HTTPS links are allowed.",
      });
    }

    const subject = await Subject.findOne({
      _id: subjectId,
      user: req.user._id,
    });

    if (!subject) {
      return res.status(404).json({
        message: "Subject not found.",
      });
    }

    const material = await CourseMaterial.create({
      title,
      url: parsedUrl.href,
      subject: subject._id,
      user: req.user._id,
    });

    res.status(201).json({
      message: "Course material added successfully!",
      material: {
        _id: material._id,
        title: material.title,
        url: material.url,
        subject: {
          _id: subject._id,
          name: subject.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}



export async function deleteLesson(req, res) {
  try {
    const deleted = await Lesson.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete lesson" });
  }
}

export async function deleteCourseMaterial(req, res) {
  try {
    const deleted = await CourseMaterial.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Material not found" });
    }

    res.json({ message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete material" });
  }
}