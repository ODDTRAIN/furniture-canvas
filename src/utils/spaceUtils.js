export const getItemDimensions = (item) => {
  // 1. Column (기둥)
  if (item.type === 'column') {
    return { w: item.width, h: 3, d: item.depth }; 
  }
  // 2. Prop (사용자 지정)
  if (item.type === 'prop') {
    return { w: item.width || 1, h: item.height || 1, d: item.depth || 0.2 };
  }
  // 3. Zone 1 (Product - GLB)
  if (item.type !== 'custom') {
    if (item.width && item.height && item.depth) {
      return { w: item.width, h: item.height, d: item.depth };
    }
    return { w: 1, h: 1, d: 1 }; 
  }
  // 4. Zone 2 (Custom Unit)
  if (item.configData && item.configData.length > 0) {
    const unit = item.configData[0];
    const realWidth = 0.450 + ((unit.columns - 1) * 0.425);
    const realDepth = 0.285;
    let realHeight = 0.15; 
    if (unit.blocks) {
      unit.blocks.forEach(block => {
        realHeight += 0.02; 
        block.rows.forEach(rowH => {
          realHeight += (rowH || 0); 
          realHeight += 0.02; 
        });
      });
    } else {
      realHeight = 1.0;
    }
    realHeight += 0.02; 
    return { w: realWidth, h: realHeight, d: realDepth };
  }
  return { w: 1, h: 1, d: 1 };
};