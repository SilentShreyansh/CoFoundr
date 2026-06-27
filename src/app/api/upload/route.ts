import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { uploadImage } from "@/lib/storage";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = await clientIp();
  if (!rateLimit(`upload:${user.id}:${ip}`, 20, 60_000).success) {
    return NextResponse.json({ error: "Too many uploads. Slow down." }, { status: 429 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const url = await uploadImage(bytes, file.type);
  return NextResponse.json({ url });
}
