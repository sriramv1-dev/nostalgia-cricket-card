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
