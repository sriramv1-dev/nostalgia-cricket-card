import { NextRequest, NextResponse } from "next/server";
import { callGemini, GeminiError } from "@/lib/gemini/client";
import { buildPlayerStatsPrompt } from "@/lib/gemini/prompts";
import { validateGeminiResponse } from "@/lib/gemini/validator";
import { insertPlayerWithStats } from "@/lib/queries/insertPlayer";
import { fetchPlayerById } from "@/lib/queries/players";
import { API_ERRORS, ERROR_MESSAGES } from "@/constants/apiErrors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name: string = body?.name?.trim();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Step 1: Call Gemini
    let raw: string;
    try {
      raw = await callGemini(buildPlayerStatsPrompt(name));
    } catch (err) {
      if (err instanceof GeminiError) {
        if (err.code === API_ERRORS.PLAYER_NOT_FOUND) {
          return NextResponse.json(
            { error: err.message, code: err.code },
            { status: 404 }
          );
        }
        if (err.code === API_ERRORS.TRUNCATED_RESPONSE) {
          return NextResponse.json(
            { error: err.message, code: err.code },
            { status: 422 }
          );
        }
        if (err.code === API_ERRORS.GEMINI_API_ERROR) {
          return NextResponse.json(
            { error: err.message, code: err.code },
            { status: 503 }
          );
        }
      }
      throw err;
    }

    // Step 2: Validate response shape
    let parsed: ReturnType<typeof validateGeminiResponse>;
    try {
      parsed = validateGeminiResponse(raw);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message === "TRUNCATED_RESPONSE") {
        return NextResponse.json(
          {
            error: ERROR_MESSAGES.TRUNCATED_RESPONSE,
            code: "TRUNCATED_RESPONSE",
          },
          { status: 422 }
        );
      }
      if (message === "INVALID_JSON") {
        return NextResponse.json(
          { error: ERROR_MESSAGES.INVALID_JSON, code: "INVALID_JSON" },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { error: "Validation failed", code: "INVALID_JSON" },
        { status: 422 }
      );
    }

    // Step 3: Return candidates if ambiguous
    if (parsed.ambiguous === true) {
      return NextResponse.json({
        ambiguous: true,
        candidates: parsed.candidates,
      });
    }

    // Step 4: Insert into DB (is_active: false, pending admin review)
    let playerId: string;
    try {
      playerId = await insertPlayerWithStats(parsed);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json(
        {
          error: ERROR_MESSAGES.DB_INSERT_FAILED,
          code: "DB_INSERT_FAILED",
          debug: msg,
        },
        { status: 500 }
      );
    }

    // Step 5: Fetch back the full player with stats
    const result = await fetchPlayerById(playerId);

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: result.data,
      source: "gemini",
      pending_review: true,
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
