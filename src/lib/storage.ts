import { randomBytes } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const useCloudinary =
  process.env.STORAGE_PROVIDER === "cloudinary" &&
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Persist an uploaded image and return its public URL.
 * Uses Cloudinary when configured (required for serverless/Vercel),
 * otherwise writes to the local /public/uploads folder (dev default).
 */
export async function uploadImage(buffer: Buffer, mime: string): Promise<string> {
  if (useCloudinary) {
    const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;
    const res = await cloudinary.uploader.upload(dataUri, { folder: "cofoundr" });
    return res.secure_url;
  }

  const ext = mime.split("/")[1].replace("jpeg", "jpg");
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buffer);
  return `/uploads/${name}`;
}
