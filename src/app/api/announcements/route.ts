import { NextResponse } from "next/server";
import { getActiveSiteAnnouncements } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const audience = searchParams.get("audience");

  if (audience !== "buyers" && audience !== "sellers") {
    return NextResponse.json({ announcements: [] });
  }

  const announcements = await getActiveSiteAnnouncements(audience);

  return NextResponse.json({ announcements });
}
