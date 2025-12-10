import React from 'react';
import { 
  WoodShelf, OuterSteelPanel, VerticalWoodPanel, ComplexColumn, CabinetLight, UnitLeg,
  WoodMaterialVertical 
} from '../configurator/ConfigAssets'; 
import { 
  getUnitWidth, SIDE_THICK, WOOD_THICK, LEG_HEIGHT, DEPTH, DICE_SIZE, COLUMN_PITCH, INNER_WIDTH 
} from '../configurator/constants';

const getDeterministicRandomLocal = (seedStr) => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  return (Math.sin(hash) * 10000) - Math.floor(Math.sin(hash) * 10000);
};

// [BlockRenderer] isLightOn prop 추가
const BlockRenderer = ({ width, rows, columns, unitId, blockId, accessories, isBase, isLightOn }) => {
  let currentY = isBase ? LEG_HEIGHT : 0; 
  const elements = [];
  
  // 1. Back Panel & Base
  const validRows = rows.filter(r => r !== null);
  const totalH = validRows.reduce((acc, h) => acc + h, 0) + (validRows.length + 1) * WOOD_THICK;
  const backPanelSeed = getDeterministicRandomLocal(`${unitId}-${blockId}-back`);
  
  elements.push(
    <mesh key="back" position={[0, currentY + totalH/2 - WOOD_THICK/2, -DEPTH/2]} castShadow receiveShadow>
      <boxGeometry args={[width, totalH, 0.005]} />
      <WoodMaterialVertical seed={backPanelSeed} />
    </mesh>
  );
  elements.push(
    <WoodShelf key="base" width={width} position={[0, currentY + WOOD_THICK/2, 0]} seed={getDeterministicRandomLocal(`${unitId}-${blockId}-base`)} />
  );
  
  // 2. Legs
  const nodeXArr = Array.from({ length: columns + 1 }, (_, i) => -width/2 + DICE_SIZE/2 + i * COLUMN_PITCH);
  if (isBase) { 
    nodeXArr.forEach((x, i) => { 
      elements.push(<UnitLeg key={`leg-f-${i}`} position={[x, LEG_HEIGHT/2, DEPTH/2 - DICE_SIZE/2]} />); 
      elements.push(<UnitLeg key={`leg-b-${i}`} position={[x, LEG_HEIGHT/2, -(DEPTH/2 - DICE_SIZE/2)]} />); 
    }); 
  }
  
  currentY += WOOD_THICK;

  // 3. Rows
  rows.forEach((h, rIdx) => {
    if (h === null || h === undefined) return; 
    const safeH = h;
    
    // Panels & Columns
    elements.push(<group key={`row-${rIdx}`} position={[0, currentY + safeH/2, 0]}>
      {nodeXArr.map((x, i) => (<group key={`col-${i}`}><ComplexColumn height={safeH} position={[x, 0, DEPTH/2 - DICE_SIZE/2]} /><ComplexColumn height={safeH} position={[x, 0, -(DEPTH/2 - DICE_SIZE/2)]} /></group>))}
      {nodeXArr.map((x, i) => { 
        const panelSeed = getDeterministicRandomLocal(`${unitId}-${blockId}-${rIdx}-panel-${i}`); 
        if(i===0) return <group key={`p-${i}`}><OuterSteelPanel height={safeH} position={[x - DICE_SIZE/2 - SIDE_THICK/2, 0, 0]} /><VerticalWoodPanel height={safeH} position={[x + DICE_SIZE/2 + WOOD_THICK/2, 0, 0]} seed={panelSeed} /></group>; 
        if(i===columns) return <group key={`p-${i}`}><VerticalWoodPanel height={safeH} position={[x - DICE_SIZE/2 - WOOD_THICK/2, 0, 0]} seed={panelSeed} /><OuterSteelPanel height={safeH} position={[x + DICE_SIZE/2 + SIDE_THICK/2, 0, 0]} /></group>; 
        return <group key={`p-${i}`}><VerticalWoodPanel height={safeH} position={[x - DICE_SIZE/2 - WOOD_THICK/2, 0, 0]} seed={panelSeed} /><VerticalWoodPanel height={safeH} position={[x + DICE_SIZE/2 + WOOD_THICK/2, 0, 0]} seed={panelSeed} /></group>; 
      })}
      
      {/* [FIX] Lighting Control Logic */}
      {Array.from({ length: columns }).map((_, c) => { 
        const centerX = (nodeXArr[c] + nodeXArr[c+1]) / 2; 
        const cellKey = `${blockId}-${rIdx}-${c}`; 
        return (
          <React.Fragment key={`cell-group-${c}`}>
             {/* isLightOn이 true일 때만 조명 렌더링 */}
            {isLightOn && (
              <CabinetLight width={INNER_WIDTH} position={[centerX, safeH/2 - 0.01, 0]} hasShelf={accessories?.[cellKey]?.type === 'shelf'} height={safeH} />
            )}
          </React.Fragment>
        ); 
      })}
    </group>);
    
    currentY += safeH; 
    elements.push(<WoodShelf key={`top-${rIdx}`} width={width} position={[0, currentY + WOOD_THICK/2, 0]} seed={getDeterministicRandomLocal(`${unitId}-${blockId}-${rIdx}-top`)} />); 
    currentY += WOOD_THICK;
  });

  return <group>{elements}</group>;
};

// [MAIN] Unit Renderer
export default function UnitRenderer({ unit, isLightOn = false }) {
  if (!unit) return null;

  const currentWidth = getUnitWidth(unit.columns);
  let curY = 0;

  return (
    <group>
      {unit.blocks.map((block, index) => {
        const isBase = index === 0;
        const validRows = block.rows.filter(r => r !== null);
        const blockHeight = validRows.reduce((a, b) => a + b + WOOD_THICK, 0) + WOOD_THICK;
        const offsetHeight = isBase ? blockHeight + LEG_HEIGHT : blockHeight;
        
        const element = (
          <group key={block.id} position={[0, curY, 0]}>
            <BlockRenderer 
              width={currentWidth} 
              rows={block.rows} 
              columns={unit.columns} 
              unitId={unit.id} 
              blockId={block.id} 
              accessories={unit.accessories} 
              isBase={isBase}
              isLightOn={isLightOn} // Prop 전달
            />
          </group>
        );
        curY += offsetHeight;
        return element;
      })}
    </group>
  );
}