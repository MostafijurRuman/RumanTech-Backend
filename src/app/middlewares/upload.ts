import multer from "multer";
import { AppError } from "@/app/errors/AppError";
import { httpStatus } from "@/app/constants/http-status";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new AppError(httpStatus.BAD_REQUEST, "Only image uploads are allowed"));
      return;
    }

    callback(null, true);
  },
});
