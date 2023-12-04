/**
 * Since this is a potentially large payload, it'd be best
 * to defer most of the crunching and duplicate removal via
 * web worker otherwise risk lagging the user down per scan
 */
onmessage = e => {
  if (!isJSON(e.data)) {
    postMessage({error: "Something went wrong with JSON parsing..."});  
  }
  const result = JSON.parse(e.data);
  const fills = result.fills.filter((v, i, a) => {
    return a.findIndex((el) => JSON.stringify(el) == JSON.stringify(v)) == i;
  })
  const strokes = result.strokes.filter((v, i, a) => {
    return a.findIndex((el) => JSON.stringify(el) == JSON.stringify(v)) == i;
  })
  postMessage(JSON.stringify({
    fills: fills,
    strokes: strokes,
    timeEnd: Date.now()
  }));
};

const isJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch(err) {
    return false;
  }
}