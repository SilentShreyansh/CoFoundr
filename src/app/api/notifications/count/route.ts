import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { getUnreadCount } from "@/lib/queries/notifications";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ count: 0 });
  const count = await getUnreadCount(user.id);
  return NextResponse.json({ count });
}
