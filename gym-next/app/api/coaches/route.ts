import { NextResponse } from "next/server";
import { filterStoredCoaches } from "@/lib/coaches";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const data = await filterStoredCoaches({
    sport: url.searchParams.get("sport") ?? undefined,
    city: url.searchParams.get("city") ?? undefined,
  });

  return NextResponse.json({ data });
}
