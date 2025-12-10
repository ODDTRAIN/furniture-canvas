import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Html, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber"; 
import { useSpring, animated } from "@react-spring/three";

import { 
  WOOD_THICK, DEPTH, DICE_SIZE, COLUMN_PITCH, SIDE_THICK, INNER_WIDTH, isHeightValid, getUnitWidth, LEG_HEIGHT 
} from "./constants";
import { styles } from "./styles";
import { 
  WoodShelf, OuterSteelPanel, VerticalWoodPanel, ComplexColumn, CabinetLight, Dimensions,
  AccessoryDoubleDoor, AccessoryFlipDoor, AccessorySpeaker, AccessoryShelf,
  WoodMaterialVertical, UnitLeg 
} from "./ConfigAssets";

// [FIX] export 추가: 다른 파일에서 사용할 수 있도록 공개
export const getDeterministicRandom = (seedStr) => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

export const GlobalSelectionMarker = ({ x, y, visible }) => {
  const lastPos = useRef({ x: x, y: y });

  if (visible) {
    lastPos.current = { x, y };
  }

  const { position, scale } = useSpring({
    position: [
      visible ? x : lastPos.current.x, 
      (visible ? y : lastPos.current.y) + 0.18, 
      0
    ],
    scale: visible ? 1 : 0, 
    config: { mass: 1, tension: 280, friction: 24 }
  });

  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = Math.sin(t * 2.5) * 0.025; 
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.z = t * 0.15;
    }
  });

  return (
    <animated.group position={position} scale={scale}>
      <mesh ref={meshRef} castShadow> 
        <sphereGeometry args={[0.02, 64, 64]} /> 
        <meshPhysicalMaterial color="#000000" metalness={0.9} roughness={0.1} clearcoat={1.0} clearcoatRoughness={0.1} envMapIntensity={1.5} />
      </mesh>
    </animated.group>
  );
};

// [FIX] export 추가
export const CellSpace = ({ width, height, position, accessoryData, activeTool, isValid, onInteract, isHighlighted }) => {
  const [hovered, setHover] = useState(false);
  useCursor(hovered && activeTool && isValid);
  
  let guideColor = "#1d1d1f"; 
  let guideOpacity = 0;
  
  if (activeTool && isValid) {
    if (activeTool === "eraser") { 
      guideColor = "#ff3b30"; 
      guideOpacity = hovered ? 0.3 : 0.1;
    } else {
      if (accessoryData) {
        guideOpacity = 0; 
      } else {
        guideColor = "#0066cc"; 
        guideOpacity = hovered ? 0.6 : 0.25; 
      }
    }
  }

  const guideZ = (DEPTH / 2) + 0.015;

  return (
    <group position={position}>
      <mesh 
        position={[0, 0, guideZ]} 
        onClick={(e) => { if (activeTool && isValid) { e.stopPropagation(); onInteract(); } }} 
        onPointerOver={(e) => { e.stopPropagation(); if (activeTool && isValid) setHover(true); }} 
        onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
      >
        <planeGeometry args={[width - 0.02, height - 0.02]} />
        <meshBasicMaterial color={guideColor} transparent opacity={guideOpacity} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {accessoryData?.type === "door-double" && <AccessoryDoubleDoor width={width} height={height} isHighlighted={isHighlighted} />}
      {accessoryData?.type === "door-flip" && <AccessoryFlipDoor width={width} height={height} isHighlighted={isHighlighted} />}
      {accessoryData?.type === "speaker" && <AccessorySpeaker width={width} height={height} isHighlighted={isHighlighted} />}
      {accessoryData?.type === "shelf" && (
        <group>
          {Array.from({ length: accessoryData.count || 1 }).map((_, i) => (
            <AccessoryShelf key={i} width={width} position={[0, -height/2 + (height/((accessoryData.count||1)+1))*(i+1), 0]} isHighlighted={isHighlighted} />
          ))}
        </group>
      )}
    </group>
  );
};

// [FIX] export 추가
export const BlockAssembler = ({ width, rows, columns, unitId, blockId, accessories, activeTool, onCellClick, isNightMode, isBase, isHighlighted, hoveredRowId }) => {
  let currentY = isBase ? LEG_HEIGHT : 0; 
  const elements = [];
  
  const totalH = rows.reduce((acc, h) => acc + (h||0), 0) + (rows.length + 1) * WOOD_THICK;
  
  const backPanelSeed = getDeterministicRandom(`${unitId}-${blockId}-back`);
  elements.push(
    <mesh key="back" position={[0, currentY + totalH/2 - WOOD_THICK/2, -DEPTH/2]} castShadow receiveShadow>
      <boxGeometry args={[width, totalH, 0.005]} />
      <WoodMaterialVertical seed={backPanelSeed} isHighlighted={isHighlighted ? 'stack' : null} /> 
    </mesh>
  );

  elements.push(<WoodShelf key="base" width={width} position={[0, currentY + WOOD_THICK/2, 0]} seed={getDeterministicRandom(`${unitId}-${blockId}-base`)} isHighlighted={isHighlighted ? 'stack' : null} />);
  
  const nodeXArr = Array.from({ length: columns + 1 }, (_, i) => -width/2 + DICE_SIZE/2 + i * COLUMN_PITCH);

  if (isBase) {
    nodeXArr.forEach((x, i) => {
      elements.push(<UnitLeg key={`leg-f-${i}`} position={[x, LEG_HEIGHT/2, DEPTH/2 - DICE_SIZE/2]} isHighlighted={isHighlighted ? 'stack' : null} />);
      elements.push(<UnitLeg key={`leg-b-${i}`} position={[x, LEG_HEIGHT/2, -(DEPTH/2 - DICE_SIZE/2)]} isHighlighted={isHighlighted ? 'stack' : null} />);
    });
  }

  currentY += WOOD_THICK;

  rows.forEach((h, rIdx) => {
    if (!h) return;
    const isRowValid = activeTool ? isHeightValid(activeTool, h) : false;
    
    const rowKey = `${unitId}-${blockId}-${rIdx}`;
    const isRowHighlighted = rowKey === hoveredRowId;
    const effectiveHighlight = isRowHighlighted ? 'row' : (isHighlighted ? 'stack' : null);
    
    elements.push(
      <group key={`row-${rIdx}`} position={[0, currentY + h/2, 0]}>
        {nodeXArr.map((x, i) => (
          <group key={`col-${i}`}>
            <ComplexColumn height={h} position={[x, 0, DEPTH/2 - DICE_SIZE/2]} isHighlighted={effectiveHighlight} />
            <ComplexColumn height={h} position={[x, 0, -(DEPTH/2 - DICE_SIZE/2)]} isHighlighted={effectiveHighlight} />
          </group>
        ))}
        {nodeXArr.map((x, i) => {
           const panelSeed = getDeterministicRandom(`${unitId}-${blockId}-${rIdx}-panel-${i}`);
           if(i===0) return <group key={`p-${i}`}><OuterSteelPanel height={h} position={[x - DICE_SIZE/2 - SIDE_THICK/2, 0, 0]} isHighlighted={effectiveHighlight} /><VerticalWoodPanel height={h} position={[x + DICE_SIZE/2 + WOOD_THICK/2, 0, 0]} seed={panelSeed} isHighlighted={effectiveHighlight} /></group>;
           if(i===columns) return <group key={`p-${i}`}><VerticalWoodPanel height={h} position={[x - DICE_SIZE/2 - WOOD_THICK/2, 0, 0]} seed={panelSeed} isHighlighted={effectiveHighlight} /><OuterSteelPanel height={h} position={[x + DICE_SIZE/2 + SIDE_THICK/2, 0, 0]} isHighlighted={effectiveHighlight} /></group>;
           return <group key={`p-${i}`}><VerticalWoodPanel height={h} position={[x - DICE_SIZE/2 - WOOD_THICK/2, 0, 0]} seed={panelSeed} isHighlighted={effectiveHighlight} /><VerticalWoodPanel height={h} position={[x + DICE_SIZE/2 + WOOD_THICK/2, 0, 0]} seed={panelSeed} isHighlighted={effectiveHighlight} /></group>;
        })}
        {Array.from({ length: columns }).map((_, c) => {
          const centerX = (nodeXArr[c] + nodeXArr[c+1]) / 2;
          const cellKey = `${blockId}-${rIdx}-${c}`;
          if (isNightMode) elements.push(<CabinetLight key={`l-${c}`} width={INNER_WIDTH} position={[centerX, h/2 - 0.01, 0]} />);
          return (
            <CellSpace 
              key={`c-${c}`} 
              width={INNER_WIDTH} 
              height={h} 
              position={[centerX, 0, 0]} 
              accessoryData={accessories?.[cellKey]} 
              activeTool={activeTool} 
              isValid={isRowValid} 
              onInteract={() => onCellClick(unitId, cellKey, h)} 
              isHighlighted={effectiveHighlight} 
            />
          );
        })}
      </group>
    );
    currentY += h;
    elements.push(<WoodShelf key={`top-${rIdx}`} width={width} position={[0, currentY + WOOD_THICK/2, 0]} seed={getDeterministicRandom(`${unitId}-${blockId}-${rIdx}-top`)} isHighlighted={effectiveHighlight} />);
    currentY += WOOD_THICK;
  });
  return <group>{elements}</group>;
};

// [FIX] export 추가
export const UnitAssembler = ({ unit, position, showDimensions, showNames, isSelected, label, activeTool, onCellClick, isNightMode, onUnitClick, hoveredBlockId, hoveredRowId }) => {
  const currentWidth = getUnitWidth(unit.columns);
  const totalHeight = unit.blocks.reduce((acc, b) => acc + b.rows.reduce((r, h) => r + h + WOOD_THICK, 0) + WOOD_THICK, 0) + LEG_HEIGHT;
  
  const [hovered, setHover] = useState(false);
  useCursor(hovered && !activeTool);
  
  let curY = 0;
  return (
    <group 
      position-x={position[0]}
      position-z={position[2]}
      position-y={0} 
      onClick={(e) => {
        if (!activeTool) {
          e.stopPropagation(); 
          onUnitClick && onUnitClick();
        }
      }}
      onPointerOver={(e) => { 
        if (!activeTool) { 
          e.stopPropagation(); 
          setHover(true); 
        } 
      }} 
      onPointerOut={(e) => { 
        if (!activeTool) { 
          e.stopPropagation(); 
          setHover(false); 
        } 
      }}
    >
      <mesh position={[0, totalHeight/2, 0]}>
        <boxGeometry args={[currentWidth + 0.1, totalHeight, DEPTH + 0.1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {unit.blocks.map((block, index) => {
        const isBase = index === 0;
        const isHighlighted = block.id === hoveredBlockId;

        const blockHeight = block.rows.reduce((a, b) => a + b + WOOD_THICK, 0) + WOOD_THICK;
        const offsetHeight = isBase ? blockHeight + LEG_HEIGHT : blockHeight;

        const el = (
          <group key={block.id} position={[0, curY, 0]}>
            <BlockAssembler 
              width={currentWidth} 
              rows={block.rows} 
              columns={unit.columns} 
              unitId={unit.id} 
              blockId={block.id} 
              accessories={unit.accessories} 
              activeTool={activeTool} 
              onCellClick={onCellClick} 
              isNightMode={isNightMode} 
              isBase={isBase} 
              isHighlighted={isHighlighted}
              hoveredRowId={hoveredRowId} 
            />
          </group>
        );
        curY += offsetHeight; 
        return el;
      })}
      <Dimensions width={currentWidth} height={totalHeight} visible={showDimensions && (hovered || isSelected)} />
      {showNames && !(showDimensions && (hovered || isSelected)) && <Html position={[0, -0.25, 0]} center zIndexRange={[60, 0]}><div style={styles.furnitureTag}>{label}</div></Html>}
    </group>
  );
};