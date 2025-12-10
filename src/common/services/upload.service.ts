import cloudinary from "../utils/cloudinary";

export async function uploadToCloudinary(fileBuffer: Buffer) {
  return await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "closet" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(fileBuffer);
  });
}
