import { Router } from "express";
import { upload } from "../../common/middleware/upload";
import { uploadImageHandler } from "./upload.controller";

const router = Router();

router.post("/image", upload.single("file"), uploadImageHandler);

export default router;
