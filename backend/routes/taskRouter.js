import express from "express";
import {
  addTasks,
  getTasks,
  updateTasks,
  deleteTask,
} from "../controllers/taskController.js";
import { decorateHtml } from "../middlewares/common/decorateHtml.js";
import { authGuard } from "../middlewares/common/checkLogin.js";
import {
  taskValidation,
  taskValidatorHandler,
  taskUpdateValidation,
  taskIdValidation,
} from "../middlewares/validators/taskValidator.js";
const router = express.Router();

router.get("/", decorateHtml("Tasks"), authGuard, getTasks);

router.post(
  "/",
  decorateHtml("Tasks"),
  authGuard,
  taskValidation,
  taskValidatorHandler,
  addTasks,
);
router.patch(
  "/:id",
  decorateHtml("Tasks"),
  authGuard,
  taskIdValidation,
  taskUpdateValidation,
  taskValidatorHandler,
  updateTasks,
);
router.delete(
  "/:id",
  decorateHtml("Tasks"),
  authGuard,
  taskIdValidation,
  taskValidatorHandler,
  deleteTask,
);
export default router;
