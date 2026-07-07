import { NextRequest, NextResponse } from "next/server";
import { searchActivePlayersByName } from "@/lib/queries";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body?.name?.trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    const { data: players, error } = await searchActivePlayersByName(name);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (players.length === 0) {
      // Not found — tell UI to show "Get Player Info" button
      return NextResponse.json({ found: false, name });
    }

    return NextResponse.json({ found: true, data: players });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
