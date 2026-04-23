export const API_ERRORS = {
  PLAYER_NOT_FOUND: "PLAYER_NOT_FOUND",
  AMBIGUOUS_NAME: "AMBIGUOUS_NAME",
  TRUNCATED_RESPONSE: "TRUNCATED_RESPONSE",
  INVALID_JSON: "INVALID_JSON",
  GEMINI_API_ERROR: "GEMINI_API_ERROR",
  DB_INSERT_FAILED: "DB_INSERT_FAILED",
} as const;

export const ERROR_MESSAGES = {
  PLAYER_NOT_FOUND: "Player not found. Check spelling or try the full name.",
  AMBIGUOUS_NAME: "Multiple players found. Please select one below.",
  TRUNCATED_RESPONSE: "Response too long. Try using the player's full name.",
  INVALID_JSON: "Could not parse stats. Please try again.",
  GEMINI_API_ERROR: "Stats service unavailable. Please try again later.",
  DB_INSERT_FAILED: "Could not save player data. Please try again.",
} as const;
