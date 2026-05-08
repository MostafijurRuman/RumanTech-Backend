import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { env } from "@/app/config/env";
import { AppError } from "@/app/errors/AppError";
import { httpStatus } from "@/app/constants/http-status";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

function assertCloudinaryConfigured() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Cloudinary environment variables are not configured"
    );
  }
}

export function uploadBufferToCloudinary(file: Express.Multer.File, folder = env.CLOUDINARY_FOLDER) {
  assertCloudinaryConfigured();

  return new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(file.buffer);
  });
}

export async function deleteCloudinaryImage(publicId?: string | null) {
  if (!publicId) return;
  assertCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId);
}
