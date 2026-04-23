import type { PlayerWithAllStats } from "@/lib/queries/types";
import type { Rarity } from "@/types";

// ── Card generation ───────────────────────────────────────────────────────────

export function buildFlavourTextPrompt(
  data: PlayerWithAllStats,
  rarity: Rarity
): string {
  const { player, stats } = data;
  const t = stats.test;
  const o = stats.odi;

  return `You are writing flavour text for a nostalgic cricket trading card.

Player: ${player.name}
Country: ${player.country}
Role: ${player.role}
Rarity: ${rarity}
Era: unknown

Career highlights:
- Test: ${t?.bat_runs ?? "-"} runs, ${t?.bat_100s ?? "-"} centuries, ${t?.bowl_wickets ?? "-"} wickets
- ODI: ${o?.bat_runs ?? "-"} runs, ${o?.bat_100s ?? "-"} centuries, ${o?.bowl_wickets ?? "-"} wickets

Write a single evocative sentence (max 20 words) that captures this player's legend — the kind of line printed at the bottom of a collector card. No statistics, just atmosphere and myth.`;
}

export function buildSpecialAbilityPrompt(
  data: PlayerWithAllStats,
  rarity: Rarity
): string {
  const { player, stats } = data;
  const t = stats.test;
  const o = stats.odi;
  const p = stats.t20i;

  const isBatsman = player.role === "batter" || player.role === "keeper";
  const isBowler = player.role === "bowler";

  const dominantStat = isBatsman
    ? `Batting avg: Test ${t?.bat_average ?? "-"}, ODI ${o?.bat_average ?? "-"}, T20I ${p?.bat_average ?? "-"}`
    : isBowler
      ? `Bowling avg: Test ${t?.bowl_average ?? "-"}, ODI ${o?.bowl_average ?? "-"}, T20I ${p?.bowl_average ?? "-"}`
      : `Batting avg: ${t?.bat_average ?? "-"} / Bowling avg: ${t?.bowl_average ?? "-"}`;

  return `You are designing a special ability for a nostalgic cricket trading card game.

Player: ${player.name}
Role: ${player.role}
Rarity: ${rarity} (${rarity === "legendary" ? "most powerful, game-changing" : rarity === "rare" ? "strong, match-winning" : rarity === "uncommon" ? "solid, reliable" : "basic"})
${dominantStat}

Return ONLY a JSON object with two fields:
- "name": a short ability name (2–4 words, title case)
- "description": one sentence describing the in-game effect (max 20 words, present tense)

Example: {"name": "Golden Arm", "description": "Reduces opponent's batting average by 10 for one round."}`;
}

// ── Battle commentary ─────────────────────────────────────────────────────────

export interface BattleContext {
  player1Name: string;
  player2Name: string;
  player1Roll: number;
  player2Roll: number;
  round: number;
  totalRounds: number;
}

export function buildBattleCommentaryPrompt(ctx: BattleContext): string {
  const {
    player1Name,
    player2Name,
    player1Roll,
    player2Roll,
    round,
    totalRounds,
  } = ctx;
  const winner = player1Roll > player2Roll ? player1Name : player2Name;
  const loser = player1Roll > player2Roll ? player2Name : player1Name;
  const margin = Math.abs(player1Roll - player2Roll);
  const isTie = player1Roll === player2Roll;

  return `You are a passionate cricket commentator writing punchy card-battle commentary.

Round ${round} of ${totalRounds}:
- ${player1Name} rolled ${player1Roll}
- ${player2Name} rolled ${player2Roll}
${isTie ? "- Result: Tie!" : `- Winner: ${winner} by ${margin} points`}

Write exactly one sentence of live commentary (max 18 words). ${
    isTie
      ? "Reflect the dramatic deadlock."
      : margin > 30
        ? `Emphasise ${winner}'s dominance over ${loser}.`
        : `Capture the close contest between them.`
  } Use cricket language. No emojis.`;
}

// ── Player stats lookup ───────────────────────────────────────────────────────

export function buildPlayerStatsPrompt(playerName: string): string {
  return `
You are a cricket statistics database. Return ONLY valid JSON, no markdown, no explanation, no code fences.

Find career statistics for the cricketer: "${playerName}"

If the name is ambiguous (could match multiple players), return:
{
  "ambiguous": true,
  "candidates": [
    { "name": "Full name", "country": "Country", "role": "batter" | "bowler" | "allrounder" | "keeper" }
  ]
}

If the player is found, return:
{
  "ambiguous": false,
  "name": "Full official name",
  "country": "Country name as used in international cricket",
  "role": "batter" | "bowler" | "allrounder" | "keeper",
  "external_id": "ESPN Cricinfo player ID if known, otherwise empty string",
  "stats": {
    "test": {
      "bat_matches": number | null,
      "bat_runs": number | null,
      "bat_not_outs": number | null,
      "bat_highest": number | null,
      "bat_average": number | null,
      "bat_100s": number | null,
      "bat_50s": number | null,
      "bat_fours": number | null,
      "bat_sixes": number | null,
      "bowl_matches": number | null,
      "bowl_wickets": number | null,
      "bowl_average": number | null,
      "bowl_economy": number | null,
      "bowl_best": "W/R format e.g. 5/30" | null,
      "bowl_4w": number | null,
      "bowl_5w": number | null,
      "field_catches": number | null,
      "field_stumpings": number | null,
      "field_runouts": number | null
    } | null,
    "odi": { same structure } | null,
    "t20i": { same structure } | null
  }
}

Rules:
- If you are not confident about a specific stat, use null for that field
- Never invent or estimate numbers — use null if uncertain
- bowl_best format must be "W/R" e.g. "6/54" or null
- bat_highest is an integer (ignore * for not out)
- Omit a format entirely by setting it to null if all stats for that format are null
`.trim();
}

// ── Player bio ────────────────────────────────────────────────────────────────

export function buildPlayerBioPrompt(data: PlayerWithAllStats): string {
  const { player, stats } = data;
  const t = stats.test;
  const o = stats.odi;
  const p = stats.t20i;

  return `Write a 2-sentence nostalgic biography for a cricket trading card.

Player: ${player.name}
Country: ${player.country}
Role: ${player.role}
Era: unknown

Stats snapshot:
- Test: ${t?.bat_runs ?? "-"} runs, ${t?.bat_100s ?? "-"} 100s, ${t?.bowl_wickets ?? "-"} wickets
- ODI: ${o?.bat_runs ?? "-"} runs, ${o?.bat_100s ?? "-"} 100s, ${o?.bowl_wickets ?? "-"} wickets
- T20I: ${p?.bat_runs ?? "-"} runs, ${p?.bowl_wickets ?? "-"} wickets

Tone: warm, reverent, like a collector recalling a golden era. No bullet points.`;
}
