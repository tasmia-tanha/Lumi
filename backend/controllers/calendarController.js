 import {calendar} from "../models/calendarEvent.js";
 
 export function getCalendar(req,res,next){
    res.render("calendar")
}

export function getCalendarDate(req, res, next) {
  res.render("calendarDate", {
    date: req.params.date,
  });
}

export async function saveCalendarDate(req, res, next) {
  try {
    const date=req.params.date;
    const {title, pinned, timeEntries } = req.body;

    const savedDate = await calendar.findOneAndUpdate(
      {
        user: req.user._id,
        date: new Date(`${date}T00:00:00.000Z`),
      },
      {
        title,
        pinned,
        timeEntries,
      },
      {
        returnDocument: 'after',
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      message: "Date details saved successfully",
      data: savedDate,
    });
  } catch (error) {
    next(error);
  }
}


export async function getCalendarDateDetails(req, res, next) {
  try {
    const date = req.params.date;

    const calendarDate = await calendar.findOne({
      user: req.user._id,
      date: new Date(`${date}T00:00:00.000Z`),
    });

    res.json({
      data: calendarDate,
    });
  } catch (error) {
    next(error);
  }
}


export async function getPinnedDates(req, res, next) {
  try {
    const pinnedDates = await calendar.find({
      user: req.user._id,
      pinned: true,
    }).select("date title");

    res.json({
      data: pinnedDates,
    });
  } catch (error) {
    next(error);
  }
}


export async function getUpcomingEvents(req, res, next) {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const events = await calendar.find({
      user: req.user._id,
      pinned:true,
      title: { $exists: true, $ne: "" },
      date: { $gte: today },
    })
      .sort({ date: 1 })
      .select("date title pinned");

    res.json({
      data: events,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTodayAgenda(req, res, next) {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const agenda = await calendar.findOne({
      user: req.user._id,
      date: today,
    }).select("date timeEntries");

    res.json({
      data: agenda,
    });
  } catch (error) {
    next(error);
  }
}