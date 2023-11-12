import config from "../../cep.config";
export const ns = config.id;

export interface cmykColor {
  cyan: number;
  magenta: number;
  yellow: number;
  black: number;
  count?: number;
  typename?: string;
}
export interface rgbColor {
  red: number;
  green: number;
  blue: number;
  count?: number;
  typename?: string;
}
export interface hsbColor {
  hue: number;
  saturation: number;
  brightness: number;
  count?: number;
  typename?: string;
}
export interface noColor {
  count?: number;
  typename?: string;
}
export interface grayColor {
  count?: number;
  typename?: string;
}
export interface multiColor {
  typename?: string;
}

export interface gradientStop {
  color: rgbColor | cmykColor | hsbColor;
  midPoint: number;
  opacity: number;
  rampPoint: number;
  typename?: string;
}

export interface gradientType {
  linear: boolean;
  radial: boolean;
}

export interface gradient {
  gradientStops: gradientStop[];
  name: string;
  type: gradientType;
  typename: string;
}

export interface gradientColor {
  angle: number;
  gradient: gradient;
  hiliteAngle: number;
  hiliteLength: number;
  length: number;
  matrix: any;
  origin: number[];
  typename: string;
}

export interface ColorPackage {
  RGB: rgbColor;
  HSB: hsbColor;
  CMYK: cmykColor;
  hex: string;
  model: string;
  name?: string;
}

export type ColorValue =
  | rgbColor
  | cmykColor
  | hsbColor
  | noColor
  | multiColor
  | grayColor
  | gradientColor;

export interface ScriptScanResult {
  hasSelection: boolean;
  selectionLength: number;
  appFill?: ColorValue;
  appStroke?: ColorValue;
  fills?: ColorValue[];
  strokes?: ColorValue[];
}
