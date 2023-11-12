import type {
  ColorValue,
  rgbColor,
  cmykColor,
  noColor,
  multiColor,
  hsbColor,
  ScriptScanResult,
  gradientColor,
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
      if (!ArrayIncludes(fillChain, item.fillColor))
        fillChain.push(JSON.parse(JSON.stringify(item.fillColor)));
      // else {
      //   fillChain = incrementCount(fillChain, item.fillColor);
      // }
    }
    if (item.strokeColor) {
      if (!ArrayIncludes(strokeChain, item.strokeColor))
        strokeChain.push(item.strokeColor);
      // else {
      //   strokeChain = incrementCount(strokeChain, item.strokeColor);
      // }
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

export const getSanitizedGradient = (color: gradientColor) => {
  //
};

export const shallowScan = () => {
  if (!app.selection.length) {
    return JSON.stringify({
      hasSelection: false,
      selectionLength: 0,
      appFill: app.activeDocument.defaultFillColor,
      appStroke: app.activeDocument.defaultStrokeColor,
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

export const getActiveFillColor = () => {
  return JSON.stringify(
    JSON.parse(JSON.stringify(app.activeDocument.defaultFillColor))
  );
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
