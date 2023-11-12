import config from "../../cep.config";
export const ns = config.id;

export interface cmykColor {
  cyan: number;
  magenta: number;
  yellow: number;
  black: number;
  typename?: string;
}
export interface rgbColor {
  red: number;
  green: number;
  blue: number;
  typename?: string;
}
export interface hsbColor {
  hue: number;
  saturation: number;
  brightness: number;
  typename?: string;
}
export interface noColor {
  typename?: string;
}
export interface multiColor {
  typename?: string;
}

export interface gradientStop {
  typename?: string;
  color: rgbColor | cmykColor | hsbColor;
}
export interface gradientColor {
  stops: gradientStop[];
}

export interface ColorPackage {
  RGB: rgbColor;
  HSB: hsbColor;
  CMYK: cmykColor;
  hex: string;
  model: string;
  name?: string;
}

export type ColorValue = rgbColor | cmykColor | hsbColor | noColor | multiColor;
