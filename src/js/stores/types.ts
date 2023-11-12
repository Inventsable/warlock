import type { ColorValue } from "../../shared/shared";

export interface SettingsStore {
  options: {
    locked: boolean;
    isCMYK: boolean;
  };
  indicator: {
    show: boolean;
    stroke: {
      active: boolean;
      color: ColorValue;
      multi: boolean;
      empty: boolean;
    };
    fill: {
      color: ColorValue;
      multi: boolean;
      empty: boolean;
    };
  };
  lists: swatchList[];
  adapter: {
    online: boolean;
    disabled: boolean;
    listenTo: {
      fillStroke: boolean;
      selection: boolean;
      documentChange: boolean;
    };
  };
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
