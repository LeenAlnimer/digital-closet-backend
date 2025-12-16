import { Router } from "express";
import { authMiddleware } from "../../../common/middleware/auth";
import { getSuggestionsHandler } from "./suggestion.controller";

const router = Router();

router.use(authMiddleware);

router.get("/", getSuggestionsHandler);

export default router;
