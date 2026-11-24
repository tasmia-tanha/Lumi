import express from "express";
import mongoose from "mongoose";
import path from "node:path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import helmet from "helmet";


//internal imports
import { notFoundHandler,errorHandler } from "./backend/middlewares/common/errorHandler.js";
import loginRouter from "./backend/routes/loginRouter.js";
import signUpRouter from "./backend/routes/signupRouter.js";
import calendarRouter from "./backend/routes/calendarRouter.js";
import dailyHabitsRouter from "./backend/routes/habitRouter.js";
import dashboardRouter from "./backend/routes/dashboardRouter.js";
import focusSessionRouter from "./backend/routes/focusRouter.js";
import lessonsRouter from "./backend/routes/lessonRouter.js";
import notesRouter from "./backend/routes/noteRouter.js";
import taskRouter from "./backend/routes/taskRouter.js";
import accountRouter from "./backend/routes/accountRouter.js";
dotenv.config();
const app=express();
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },
  })
);


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.set("view engine","ejs");

app.use(express.static(path.join(__dirname,"frontend")));

app.use(cookieParser(process.env.COOKIE_SECRET));

//routing setup
app.use("/",loginRouter);
app.use("/calendar",calendarRouter);
app.use("/dailyHabits",dailyHabitsRouter);
app.use("/dashboard",dashboardRouter);
app.use("/focusSession",focusSessionRouter);
app.use("/lessons",lessonsRouter);
app.use("/notes",notesRouter);
app.use("/task",taskRouter);
app.use("/signup",signUpRouter);
app.use("/account", accountRouter);

//error handling

app.use(notFoundHandler);

app.use(errorHandler);

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_CONNECTION_STRING);

    console.log("Database connection successful");

    app.listen(process.env.PORT, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}

startServer();


//after selecting a host remember to add trust proxy