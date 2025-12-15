import { Router } from "express";
import { authMiddleware } from "../../../common/middleware/auth";
import {
  createScheduleHandler,
  getSchedulesHandler,
  getScheduleByIdHandler,
  updateScheduleHandler,
  deleteScheduleHandler,
} from "./schedule.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createScheduleHandler);
router.get("/", getSchedulesHandler);
router.get("/:id", getScheduleByIdHandler);
router.put("/:id", updateScheduleHandler);
router.delete("/:id", deleteScheduleHandler);

export default router;
