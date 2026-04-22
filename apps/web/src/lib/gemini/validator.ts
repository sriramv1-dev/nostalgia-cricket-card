import { z } from 'zod'

const FormatStatsSchema = z.object({
  bat_matches:     z.number().int().nullable(),
  bat_runs:        z.number().int().nullable(),
  bat_not_outs:    z.number().int().nullable(),
  bat_highest:     z.number().int().nullable(),
  bat_average:     z.number().nullable(),
  bat_100s:        z.number().int().nullable(),
  bat_50s:         z.number().int().nullable(),
  bat_fours:       z.number().int().nullable(),
  bat_sixes:       z.number().int().nullable(),
  bowl_matches:    z.number().int().nullable(),
  bowl_wickets:    z.number().int().nullable(),
  bowl_average:    z.number().nullable(),
  bowl_economy:    z.number().nullable(),
  bowl_best:       z.string().nullable(),
  bowl_4w:         z.number().int().nullable(),
  bowl_5w:         z.number().int().nullable(),
  field_catches:   z.number().int().nullable(),
  field_stumpings: z.number().int().nullable(),
  field_runouts:   z.number().int().nullable(),
})

const RoleEnum = z.enum(['batter', 'bowler', 'allrounder', 'keeper'])

const AmbiguousResponseSchema = z.object({
  ambiguous:  z.literal(true),
  candidates: z.array(
    z.object({
      name:    z.string(),
      country: z.string(),
      role:    RoleEnum,
    })
  ),
})

const PlayerResponseSchema = z.object({
  ambiguous:   z.literal(false),
  name:        z.string().min(1),
  country:     z.string().min(1),
  role:        RoleEnum,
  external_id: z.string(),
  stats: z.object({
    test: FormatStatsSchema.nullable(),
    odi:  FormatStatsSchema.nullable(),
    t20i: FormatStatsSchema.nullable(),
  }),
})

const GeminiResponseSchema = z.union([AmbiguousResponseSchema, PlayerResponseSchema])

export type GeminiAmbiguous = z.infer<typeof AmbiguousResponseSchema>
export type GeminiPlayer    = z.infer<typeof PlayerResponseSchema>
export type GeminiResponse  = z.infer<typeof GeminiResponseSchema>

export function validateGeminiResponse(raw: string): GeminiResponse {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    const open  = (raw.match(/{/g) ?? []).length
    const close = (raw.match(/}/g) ?? []).length
    if (open > close) throw new Error('TRUNCATED_RESPONSE')
    throw new Error('INVALID_JSON')
  }
  return GeminiResponseSchema.parse(parsed)
}
