import { Response } from "express";
import { AuthRequest } from "../../../common/middleware/auth";
import {
  createSchedule,
  getSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from "./schedule.service";

// POST /schedules
export async function createScheduleHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { outfitId, date, note } = req.body;

    if (!outfitId || !date) {
      return res.status(422).json({
        message: "outfitId and date are required",
      });
    }

    const schedule = await createSchedule(userId, {
      outfitId,
      date,
      note,
    });

    return res.status(201).json(schedule);
  } catch (err: any) {
    if (err.message === "OUTFIT_NOT_FOUND") {
      return res.status(404).json({ message: "Outfit not found" });
    }
    if (err.message === "DATE_ALREADY_SCHEDULED") {
      return res.status(409).json({ message: "Date already has an outfit" });
    }

    console.error("Create schedule error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /schedules
export async function getSchedulesHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const schedules = await getSchedules(userId);
    return res.status(200).json(schedules);
  } catch (err) {
    console.error("Get schedules error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// GET /schedules/:id
export async function getScheduleByIdHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Schedule ID is required" });
    }

    const schedule = await getScheduleById(userId, id);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    return res.status(200).json(schedule);
  } catch (err) {
    console.error("Get schedule error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// PUT /schedules/:id
export async function updateScheduleHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { outfitId, date, note } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Schedule ID is required" });
    }

    const updated = await updateSchedule(userId, id, {
      outfitId,
      date,
      note,
    });

    return res.status(200).json(updated);
  } catch (err: any) {
    if (err.message === "SCHEDULE_NOT_FOUND") {
      return res.status(404).json({ message: "Schedule not found" });
    }
    if (err.message === "OUTFIT_NOT_FOUND") {
      return res.status(404).json({ message: "Outfit not found" });
    }
    if (err.message === "DATE_ALREADY_SCHEDULED") {
      return res.status(409).json({ message: "Date already has an outfit" });
    }

    console.error("Update schedule error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// DELETE /schedules/:id
export async function deleteScheduleHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!id) {
      return res.status(400).json({ message: "Schedule ID is required" });
    }

    await deleteSchedule(userId, id);
    return res.status(200).json({ message: "Schedule deleted" });
  } catch (err: any) {
    if (err.message === "SCHEDULE_NOT_FOUND") {
      return res.status(404).json({ message: "Schedule not found" });
    }

    console.error("Delete schedule error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
