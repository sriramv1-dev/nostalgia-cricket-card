export const CARD_WIDTH = 750;
export const CARD_HEIGHT = 1050;

export const CARD_SCALES = {
  grid: 0.333,
  detail: 0.5,
} as const;

export const CARD_DISPLAY = {
  grid: { width: 250, height: 350 },
  detail: { width: 375, height: 525 },
} as const;

export const CARD_LOGO = {
  brand: { width: 500, height: 200 },
  player: { height: 180 },
} as const;

export type CardScale = keyof typeof CARD_SCALES;
