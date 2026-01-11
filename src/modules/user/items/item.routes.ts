import { Router } from "express";
import { authMiddleware } from "../../../common/middleware/auth";
import {
  createItemHandler,
  getItemsHandler,
  getItemByIdHandler,
  updateItemHandler,
  deleteItemHandler,
} from "./item.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createItemHandler);

router.get("/", getItemsHandler);

router.get("/:id", getItemByIdHandler);

router.put("/:id", updateItemHandler);

router.delete("/:id", deleteItemHandler);

export default router;
