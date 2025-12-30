import { Request, Response } from "express";
import { uploadToCloudinary } from "../../common/services/upload.service";

export async function uploadImageHandler(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    const result: any = await uploadToCloudinary(req.file.buffer);

    return res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Upload failed" });
  }
}
