// import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import multer from "multer";
// import dotenv from "dotenv";
// import path from "path";
// import { fileURLToPath } from "url";
// import ErrorHandler from "../utils/errorHandler.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// dotenv.config({ path: path.join(__dirname, "..", "config", "config.env") });

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "project-travel-hero",
//     allowed_formats: ["jpg", "jpeg", "png", "webp"],
//     transformation: [
//       { width: 1920, height: 1080, crop: "limit", quality: "auto" },
//     ],
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true);
//   } else {
//     cb(
//       new ErrorHandler(
//         "Unsupported file format. Only images are allowed.",
//         400,
//       ),
//       false,
//     );
//   }
// };

// export const uploadImage = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
// });

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import ErrorHandler from "../utils/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", "config", "config.env") });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith("video/");
    return {
      folder: "project-travel-hero",
      resource_type: isVideo ? "video" : "image",
      allowed_formats: isVideo
        ? ["mp4", "mov", "webm"]
        : ["jpg", "jpeg", "png", "webp"],
      ...(isVideo
        ? {}
        : {
            transformation: [
              { width: 1920, height: 1080, crop: "limit", quality: "auto" },
            ],
          }),
    };
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/")
  ) {
    cb(null, true);
  } else {
    cb(
      new ErrorHandler(
        "Unsupported file format. Only images and videos are allowed.",
        400,
      ),
      false,
    );
  }
};

export const uploadMedia = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Increased to 50MB for videos
});
