import type { ColorValue } from "../../shared/shared";

export interface SettingsStore {
  selection: {
    length: number;
  };
  options: {
    locked: boolean;
    isCMYK: boolean;
    activeIndex: number;
    includeIndicatorInDeepScan: boolean;
    displayTooltipOnSwatch: boolean;
    displayColorModeInTooltip: boolean;
    displayCountInTooltip: boolean;
  };
  filters: {
    indicatorsOnTop: boolean;
    byHue: boolean;
    bySaturation: boolean;
    byFrequency: boolean;
    reversed: boolean;
  };
  indicator: {
    show: boolean;
    stroke: {
      active: boolean;
      colors: ColorValue[];
    };
    fill: {
      colors: ColorValue[];
    };
  };
  lists: swabList[];
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

export interface swab {
  name?: string;
  color: ColorValue;
  index: number;
  count: number;
  types: string[];
}

export interface swabList {
  name?: string;
  index: number;
  swabs: swab[];
}
