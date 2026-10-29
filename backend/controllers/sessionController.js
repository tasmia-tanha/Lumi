import { FocusSession } from "../models/focusSession.js";
import People from "../models/people.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const BANGLADESH_OFFSET_MS = 6 * 60 * 60 * 1000;

function getTodayBounds() {
  const now = new Date();
  const shiftedNow = new Date(now.getTime() + BANGLADESH_OFFSET_MS);
  shiftedNow.setUTCHours(0, 0, 0, 0);

  const start = new Date(shiftedNow.getTime() - BANGLADESH_OFFSET_MS);

  return {
    start,
    end: new Date(start.getTime() + DAY_IN_MS),
  };
}

function getBangladeshDateKey(date) {
  return new Date(
    new Date(date).getTime() + BANGLADESH_OFFSET_MS,
  )
    .toISOString()
    .slice(0, 10);
}

function getDailyGoalMinutes(user) {
  const goal = Number(user?.dailyGoalMinutes);

  return Math.min(
    1440,
    Math.max(1, Number.isFinite(goal) && goal > 0 ? goal : 120),
  );
}

export function getFocusSession(req, res) {
  res.render("focusSession", {
    dailyGoalMinutes: getDailyGoalMinutes(req.user),
  });
}

export async function saveFocusSession(req, res, next) {
  try {
    
    const duration = Number(req.body.duration);
    const allowedModes = ["free", "pomodoro", "deep"];
    const mode = allowedModes.includes(req.body.mode)
      ? req.body.mode
      : "free";

    if (!Number.isFinite(duration) || duration < 1000) {
      return res.status(400).json({
        message: "Study duration must be at least one second.",
      });
    }

    const session = await FocusSession.create({
      user: req.user._id,
      duration: Math.floor(duration),
      mode,
    });

    return res.status(201).json({
      message: "Study session saved successfully.",
      data: session,
    });
  } catch (error) {
    next(error);
  }
}


export async function getTotalStudyTime(req, res, next) {
  try {
    const { start, end } = getTodayBounds();

    
    const user = await People.findById(req.user._id)
      .select("dailyGoalMinutes")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User account not found." });
    }

    const sessions = await FocusSession.find({
      user: req.user._id,
    })
      .select("duration createdAt mode")
      .sort({ createdAt: -1 })
      .lean();

    const todaySessions = sessions.filter((session) => {
      const date = new Date(session.createdAt);
      return date >= start && date < end;
    });

    const todayMilliseconds = todaySessions.reduce(
      (sum, session) => sum + session.duration,
      0,
    );

    const allTimeMilliseconds = sessions.reduce(
      (sum, session) => sum + session.duration,
      0,
    );

    const dailyGoalMinutes = getDailyGoalMinutes(user);
    const dailyGoalMilliseconds = dailyGoalMinutes * 60 * 1000;
    const goalMet = todayMilliseconds >= dailyGoalMilliseconds;

    const dailyTotals = new Map();

    for (const session of sessions) {
      const day = getBangladeshDateKey(session.createdAt);
      dailyTotals.set(
        day,
        (dailyTotals.get(day) || 0) + session.duration,
      );
    }

    const todayKey = getBangladeshDateKey(new Date());
    let streak = 0;

    for (let offset = 0; ; offset++) {
      const date = new Date(`${todayKey}T00:00:00.000Z`);
      date.setUTCDate(date.getUTCDate() - offset);

      const dayKey = date.toISOString().slice(0, 10);
      const total = dailyTotals.get(dayKey) || 0;

      if (total < dailyGoalMilliseconds) break;
      streak++;
    }

    return res.json({
      totalMilliseconds: todayMilliseconds,
      todayMilliseconds,
      allTimeMilliseconds,
      dailyGoalMinutes,
      goalMet,
      streak,
      lastSession: sessions[0] || null,
    });
  } catch (error) {
    next(error);
  }
}

export async function getWeeklyStudyTime(req, res, next) {
  try {
    const now = new Date();

    // Get today's date in Bangladesh time
    const bdNow = new Date(
      now.getTime() + BANGLADESH_OFFSET_MS,
    );

    // Find Sunday at the start of this week
    const daysSinceSunday = bdNow.getUTCDay();
    bdNow.setUTCDate(bdNow.getUTCDate() - daysSinceSunday);
    bdNow.setUTCHours(0, 0, 0, 0);

    // Convert Sunday midnight back to UTC
    const start = new Date(
      bdNow.getTime() - BANGLADESH_OFFSET_MS,
    );

    const end = new Date(start.getTime() + 7 * DAY_IN_MS);

    const sessions = await FocusSession.find({
      user: req.user._id,
      createdAt: { $gte: start, $lt: end },
    })
      .select("duration createdAt")
      .lean();

    const dailyTotals = Array(7).fill(0);

    for (const session of sessions) {
      const dayKey = getBangladeshDateKey(session.createdAt);
      const date = new Date(`${dayKey}T00:00:00.000Z`);
      const dayIndex = date.getUTCDay();

      dailyTotals[dayIndex] += session.duration;
    }

    const totalMilliseconds = dailyTotals.reduce(
      (sum, duration) => sum + duration,
      0,
    );

    res.json({
      totalMilliseconds,
      dailyTotals,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDailyGoal(req, res, next) {
  try {
    const hours = Number(req.body.hours);
    const minutes = Number(req.body.minutes);

    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      hours > 24 ||
      minutes < 0 ||
      minutes > 59 ||
      hours * 60 + minutes < 1 ||
      hours * 60 + minutes > 1440
    ) {
      return res.status(400).json({
        message: "Choose a goal between 1 minute and 24 hours.",
      });
    }

    const dailyGoalMinutes = hours * 60 + minutes;

    const updatedUser = await People.findByIdAndUpdate(
      req.user._id,
      { $set: { dailyGoalMinutes } },
      { returnDocument:"after", runValidators: true },
    );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    return res.json({
      message: "Daily goal saved successfully!",
      dailyGoalMinutes,
    });
  } catch (error) {
    next(error);
  }
}
