import { Router } from "express";
import { authMiddleware } from "../../../common/middleware/auth";
import {
  createOutfitHandler,
  getOutfitsHandler,
  getOutfitByIdHandler,
  updateOutfitHandler,
  deleteOutfitHandler,
} from "./outfit.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", createOutfitHandler);
router.get("/", getOutfitsHandler);
router.get("/:id", getOutfitByIdHandler);
router.put("/:id", updateOutfitHandler);
router.delete("/:id", deleteOutfitHandler);

export default router;
