export interface CharacterColors {
  cap: string;
  capAccent: string;
  gloves: string;
  pads: string;
  shoes: string;
  bat: string;
  ball: string;
  wickets: string;
}

/** Shape of the per-shot centroid JSON served from /data/centroids/. */
export interface CentroidData {
  imageWidth: number;
  imageHeight: number;
  centroids: Partial<Record<keyof CharacterColors, { x: number; y: number }>>;
}

export interface CountryStyles {
  border: string;
  bgStart: string;
  bgEnd: string;
  textColor: string;
  character: CharacterColors;
}

export interface CountryTheme extends CountryStyles {
  country: string;
  presetName: string;
  savedAt: string;
}
