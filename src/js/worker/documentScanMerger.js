/**
 * Only active for large whole document scanning
 */
onmessage = e => {
  if (!isJSON(e.data)) {
    postMessage({error: "Something went wrong with JSON parsing..."});  
  }
  const result = JSON.parse(e.data);
  const finalList = result.colors.reduce(mergeColorsReducer, []);
  postMessage(JSON.stringify({
    timeEnd: Date.now(),
    list: finalList
  }));
};

const mergeColorsReducer = (
  accumulator,
  currentItem
) => {
  if (currentItem.data.typename === 'NoColor') {
    return accumulator;
  }
  const existingItem = accumulator.find(
    (item) => JSON.stringify(item.color) === JSON.stringify(currentItem.data)
  );
  if (existingItem) {
    if (!existingItem.types.includes(currentItem.type)) existingItem.types.push(currentItem.type);
    existingItem.count += 1;
  } else {
    accumulator.push({
      color: currentItem.data,
      types: [currentItem.type],
      count: 1,
      index: accumulator.length
    });
  }
  return accumulator;
};

const isJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch(err) {
    return false;
  }
}