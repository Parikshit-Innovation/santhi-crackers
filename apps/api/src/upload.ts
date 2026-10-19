import { v2 as cloudinary } from "cloudinary";
import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";

// Initialize Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "qpdmp8ci",
  api_key: process.env.CLOUDINARY_API_KEY || "877533715621553",
  api_secret: process.env.CLOUDINARY_API_SECRET || "YeTRcAUMbYsbExg8ITAhhcl2Yis",
  secure: true,
});

// Configure Multer memory storage
const memoryStorage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, png, webp, gif, etc.)"));
  }
};

export const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});

export const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const handler = upload.any();
  handler(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message || "File upload failed" });
    }
    next();
  });
};

/**
 * Upload buffer to Cloudinary
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = "santhi-crackers",
  filename?: string
): Promise<{ url: string; secure_url: string; public_id: string; format: string }> {
  return new Promise((resolve, reject) => {
    const cleanPublicId = filename
      ? `${path.parse(filename).name.replace(/[^a-zA-Z0-9_-]/g, "_")}_${Date.now()}`
      : `img_${Date.now()}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        public_id: cleanPublicId,
        overwrite: true,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          url: result.url,
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Express handler for POST /api/upload
 */
export async function handleImageUpload(req: Request, res: Response): Promise<void> {
  try {
    let file: Express.Multer.File | undefined;
    if (req.file) {
      file = req.file;
    } else if (Array.isArray(req.files) && req.files.length > 0) {
      file = req.files[0];
    } else if (req.files && typeof req.files === "object") {
      const fileList = Object.values(req.files).flat();
      if (fileList.length > 0) file = fileList[0];
    }

    if (!file) {
      res.status(400).json({ error: "No image file provided in request." });
      return;
    }

    const folder = (req.body?.folder as string) || "santhi-crackers";
    const result = await uploadBufferToCloudinary(file.buffer, folder, file.originalname);

    res.status(200).json({
      success: true,
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
    });
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    res.status(500).json({ error: err.message || "Failed to upload image to Cloudinary." });
  }
}
