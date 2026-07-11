import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { getProfileNotifications } from "@/lib/data";

export async function GET(request: Request) {
  const profile = await getCurrentProfile();

  if (!profile) {
    return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedLimit = Number(searchParams.get("limit") ?? 5);
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 20)
    : 5;
  const notifications = await getProfileNotifications(profile.id, limit);
  const unreadCount = notifications.filter((notification) => !notification.read_at).length;

  return NextResponse.json(
    { notifications, unreadCount },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
