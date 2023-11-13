/**
 * TODO
 *
 * - Text color is not picked up by panel
 * - Eyedropper events should be used for scans if not triggering Selection
 */

import type {
  ColorValue,
  rgbColor,
  cmykColor,
  noColor,
  multiColor,
  hsbColor,
  ScriptScanResult,
  gradientColor,
  gradientStop,
  gradient,
  ScriptDeepScanOptions,
} from "../../shared/shared";

export const checkFillStroke = (): boolean => {
  return app.isStrokeActive();
};

export const ArrayIncludes = (haystack: any[], needle: any) => {
  for (let i = 0; i < haystack.length; i++) {
    if (haystack[i] == needle) return true;
  }
  return false;
};

export const shallowScanItem = (
  item: any,
  fillChain: any[],
  strokeChain: any[]
) => {
  if (item.fillColor || item.strokeColor) {
    if (item.fillColor) {
      if (!ArrayIncludes(fillChain, getColor(item.fillColor)))
        fillChain.push(getColor(item.fillColor));
    }
    if (item.strokeColor) {
      if (!ArrayIncludes(strokeChain, getColor(item.strokeColor)))
        strokeChain.push(getColor(item.strokeColor));
    }
  }
  if (item.pathItems && item.pathItems.length) {
    for (let i = 0; i < item.pathItems.length; i++) {
      const result = shallowScanItem(item.pathItems[i], fillChain, strokeChain);
      fillChain = result.fills;
      strokeChain = result.strokes;
    }
  }
  if (item.pageItems && item.pageItems.length) {
    for (let i = 0; i < item.pageItems.length; i++) {
      const result = shallowScanItem(item.pageItems[i], fillChain, strokeChain);
      fillChain = result.fills;
      strokeChain = result.strokes;
    }
  }
  return {
    fills: fillChain,
    strokes: strokeChain,
  };
};

export const deepScanItem = (item: any, colorChain: any[]) => {
  if (item.fillColor || item.strokeColor) {
    if (item.fillColor) {
      // if (!ArrayIncludes(colorChain, getColor(item.fillColor)))
      colorChain.push({ data: getColor(item.fillColor), type: "fill" });
    }
    if (item.strokeColor) {
      // if (!ArrayIncludes(colorChain, getColor(item.strokeColor)))
      colorChain.push({ data: getColor(item.strokeColor), type: "stroke" });
    }
  }
  if (item.pathItems && item.pathItems.length) {
    for (let i = 0; i < item.pathItems.length; i++) {
      const result = deepScanItem(item.pathItems[i], colorChain);
      colorChain = result;
    }
  }
  if (item.pageItems && item.pageItems.length) {
    for (let i = 0; i < item.pageItems.length; i++) {
      const result = deepScanItem(item.pageItems[i], colorChain);
      colorChain = result;
    }
  }
  return colorChain;
};

export const getSanitizedGradient = (color: gradientColor) => {
  const grad = {
    name: color.gradient.name,
    type: {
      linear: /linear/i.test(color.gradient.type + ""),
      radial: /radial/i.test(color.gradient.type + ""),
    },
    typename: color.gradient.typename,
    gradientStops: [] as gradientStop[],
  } as gradient;
  for (let i = color.gradient.gradientStops.length - 1; i >= 0; i--) {
    const gStop = color.gradient.gradientStops[i];
    grad.gradientStops.push({
      color: gStop.color,
      midPoint: gStop.midPoint,
      opacity: gStop.opacity,
      rampPoint: gStop.rampPoint,
      typename: gStop.typename,
    } as gradientStop);
  }
  return {
    angle: color.angle,
    hiliteAngle: color.hiliteAngle,
    hiliteLength: color.hiliteLength,
    length: color.length,
    matrix: color.matrix,
    origin: color.origin,
    typename: color.typename,
    gradient: grad,
  } as gradientColor;
};

export const getColor = (color: ColorValue) => {
  if (/gradient/i.test(color + ""))
    return getSanitizedGradient(color as gradientColor);
  else return color;
};

export const shallowScan = () => {
  if (!app.selection.length) {
    return JSON.stringify({
      hasSelection: false,
      selectionLength: 0,
      appFill: getColor(app.activeDocument.defaultFillColor),
      appStroke: getColor(app.activeDocument.defaultStrokeColor),
    } as ScriptScanResult);
  }
  let fillChain: any[] = [],
    strokeChain: any[] = [];
  for (let i = 0; i < app.selection.length; i++) {
    const result = shallowScanItem(app.selection[i], fillChain, strokeChain);
    fillChain = result.fills;
    strokeChain = result.strokes;
  }
  return JSON.stringify({
    hasSelection: true,
    selectionLength: app.selection.length,
    fills: fillChain,
    strokes: strokeChain,
  } as ScriptScanResult);
};

export const deepScan = (cfg: string) => {
  const config = JSON.parse(cfg) as ScriptDeepScanOptions;
  let colorChain: any[] = [];
  for (let i = 0; i < app.activeDocument.pageItems.length; i++) {
    const result = deepScanItem(app.activeDocument.pageItems[i], colorChain);
    colorChain = result;
  }
  if (config.includeIndicator) {
    colorChain.push({
      data: getColor(app.activeDocument.defaultFillColor),
      type: "fill",
    });
    colorChain.push({
      data: getColor(app.activeDocument.defaultStrokeColor),
      type: "stroke",
    });
  }
  return JSON.stringify({
    colors: colorChain as ColorValue[],
  } as ScriptScanResult);
};

export const getActiveFillColor = () => {
  return JSON.stringify(getColor(app.activeDocument.defaultFillColor));
};

//
export const incrementCount = (haystack: any[], needle: any) => {
  let target = null;
  for (let i = 0; i < haystack.length; i++) {
    if (haystack[i] == needle) target = haystack[i];
  }
  if (target) {
    target["count"] = target.count + 1 || 0;
  }
  return haystack;
};

const getColorValue = (item: any, isStroke: boolean): ColorValue | void => {
  const str = item + "";
  if (/rgb/i.test(str)) {
    return {
      red: item.red,
      green: item.green,
      blue: item.blue,
      typename: "RGBColor",
    } as rgbColor;
  } else if (/cmyk/i.test(str)) {
    return {
      cyan: item.cyan,
      magenta: item.magenta,
      yellow: item.yellow,
      black: item.black,
      typename: "CMYKColor",
    } as cmykColor;
  } else if (/gray/i.test(str)) {
    return {
      typename: "multiColor",
    } as multiColor;
  } else if (/no/i.test(str)) {
    return {
      typename: "noColor",
    } as noColor;
  }
};
