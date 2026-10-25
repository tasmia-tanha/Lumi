import Habit from "../models/habitModel.js";
import HabitCheckIn from "../models/habitCheckinModel.js";

export async function getHabits(req, res, next) {
  try {
    const habits = await Habit.find({
      user: req.user._id,
    }).sort({ createdAt: 1 });

    const checkIns = await HabitCheckIn.find({
      user: req.user._id,
    }).select("habit date");

    res.render("dailyHabits", {
      habits,
      checkIns,
    });
  } catch (error) {
    next(error);
  }
}

export async function addHabit(req, res, next) {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Habit name is required",
      });
    }

    const habit = await Habit.create({
      name: name.trim(),
      user: req.user._id,
    });

    res.status(201).json({ habit });
  } catch (error) {
    next(error);
  }
}

export async function deleteHabit(req, res, next) {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({
        message: "Habit not found",
      });
    }

    await HabitCheckIn.deleteMany({
      habit: habit._id,
      user: req.user._id,
    });

    res.json({
      message: "Habit deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function toggleHabitCheckIn(req, res, next) {
  try {
    const { date, completed } = req.body;

    const habit = await Habit.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!habit) {
      return res.status(404).json({
        message: "Habit not found",
      });
    }

    if (
      typeof completed !== "boolean" ||
      !date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return res.status(400).json({
        message: "A valid date and completed value are required",
      });
    }

    const [year, month, day] = date.split("-").map(Number);
    const checkInDate = new Date(Date.UTC(year, month - 1, day));

    if (
      checkInDate.getUTCFullYear() !== year ||
      checkInDate.getUTCMonth() !== month - 1 ||
      checkInDate.getUTCDate() !== day
    ) {
      return res.status(400).json({
        message: "Invalid date",
      });
    }

    if (completed) {
      await HabitCheckIn.findOneAndUpdate(
        {
          habit: habit._id,
          user: req.user._id,
          date: checkInDate,
        },
        {
          $setOnInsert: {
            habit: habit._id,
            user: req.user._id,
            date: checkInDate,
          },
        },
        {
          upsert: true,
          returnDocument: "after",
        },
      );
    } else {
      await HabitCheckIn.deleteOne({
        habit: habit._id,
        user: req.user._id,
        date: checkInDate,
      });
    }

    res.json({
      message: completed ? "Habit checked in" : "Habit check-in removed",
    });
  } catch (error) {
    next(error);
  }
}

export async function getHabitStats(req, res, next) {
  try {
    const userId = req.user._id;

    // Get today's date in Bangladesh.
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const values = Object.fromEntries(
      parts.map(({ type, value }) => [type, value]),
    );

    const year = Number(values.year);
    const month = Number(values.month);
    const day = Number(values.day);

    const dateKey = (y, m, d) =>
      `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const todayKey = dateKey(year, month, day);
    const startOfToday = new Date(Date.UTC(year, month - 1, day));
    const startOfTomorrow = new Date(Date.UTC(year, month - 1, day + 1));
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const startOfNextMonth = new Date(Date.UTC(year, month, 1));

    // Load ALL check-ins so older streaks are preserved.
    const [habits, checkIns] = await Promise.all([
      Habit.find({ user: userId }).select("_id createdAt"),
      HabitCheckIn.find({ user: userId }).select("habit date"),
    ]);

    const habitIds = new Set(habits.map((habit) => habit._id.toString()));

    const validCheckIns = checkIns.filter((checkIn) =>
      habitIds.has(checkIn.habit.toString()),
    );

    // Today's progress.
    const completedToday = new Set(
      validCheckIns
        .filter(
          (checkIn) =>
            checkIn.date >= startOfToday && checkIn.date < startOfTomorrow,
        )
        .map((checkIn) => checkIn.habit.toString()),
    );

    const totalHabits = habits.length;
    const todayCompleted = completedToday.size;

    const todayProgress =
      totalHabits === 0 ? 0 : Math.round((todayCompleted / totalHabits) * 100);

    // Monthly progress: keep the existing whole-month formula.
    const monthlyCheckins = validCheckIns.filter(
      (checkIn) =>
        checkIn.date >= startOfMonth && checkIn.date < startOfTomorrow,
    ).length;

    const totalPossible = totalHabits * day;

    const monthlyCompletion =
      totalPossible === 0
        ? 0
        : Math.round((monthlyCheckins / totalPossible) * 100);

    // Group check-ins by date.
    const completedByDate = new Map();

    for (const checkIn of validCheckIns) {
      const key = checkIn.date.toISOString().slice(0, 10);

      if (!completedByDate.has(key)) {
        completedByDate.set(key, new Set());
      }

      completedByDate.get(key).add(checkIn.habit.toString());
    }

    // A new habit affects streaks only from its creation date.
    const createdDateKey = (createdAt) => {
      const p = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).formatToParts(createdAt);

      const v = Object.fromEntries(p.map(({ type, value }) => [type, value]));

      return dateKey(Number(v.year), Number(v.month), Number(v.day));
    };

    const isSuccessfulDay = (key) => {
  const requiredHabits = habits.filter(
    (habit) => createdDateKey(habit.createdAt) <= key
  );

  if (requiredHabits.length === 0) return false;

  const completed = completedByDate.get(key) || new Set();

  return requiredHabits.every((habit) =>
    completed.has(habit._id.toString())
  );
};
    
    
    const previousDateKey = (key) => {
      const [y, m, d] = key.split("-").map(Number);
      return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
    };

    let currentStreak = 0;
    let cursor = isSuccessfulDay(todayKey)
      ? todayKey
      : previousDateKey(todayKey);

    while (isSuccessfulDay(cursor)) {
      currentStreak++;
      cursor = previousDateKey(cursor);
    }

    // Best streak across all available history.
    const possibleDates = [
      ...habits.map((habit) => createdDateKey(habit.createdAt)),
      ...validCheckIns.map((checkIn) =>
        checkIn.date.toISOString().slice(0, 10),
      ),
    ].sort();

    let bestStreak = 0;
    let runningStreak = 0;

    if (possibleDates.length > 0) {
      let cursorDate = new Date(`${possibleDates[0]}T00:00:00Z`);

      while (cursorDate < startOfTomorrow) {
        const key = cursorDate.toISOString().slice(0, 10);

        if (isSuccessfulDay(key)) {
          runningStreak++;
          bestStreak = Math.max(bestStreak, runningStreak);
        } else {
          runningStreak = 0;
        }

        cursorDate.setUTCDate(cursorDate.getUTCDate() + 1);
      }
    }

    res.json({
      todayCompleted,
      totalHabits,
      todayProgress,
      monthlyCheckins,
      monthlyCompletion,
      currentStreak,
      bestStreak,
    });
  } catch (error) {
    next(error);
  }
}
