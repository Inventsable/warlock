import type { ColorValue } from "../../shared/shared";

export interface SettingsStore {
  options: {
    locked: boolean;
    isCMYK: boolean;
  };
  indicator: {
    stroke: {
      active: boolean;
      color: ColorValue;
      multi: boolean;
      empty: boolean;
    };
    fill: {
      color: ColorValue;
      multi: false;
      empty: boolean;
    };
  };
  lists: swatchList[];
}

export interface swatch {
  name?: string;
  color: ColorValue;
  index: number;
}

export interface swatchList {
  name?: string;
  index: number;
  swatches: swatch[];
}
