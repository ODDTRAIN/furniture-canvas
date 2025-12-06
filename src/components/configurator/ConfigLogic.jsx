import React, { useState, useRef } from "react";
import * as THREE from "three";
import { Html, useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber"; 
import { useSpring, animated } from "@react-spring/three";

import { 
  WOOD_THICK, DEPTH, DICE_SIZE, COLUMN_PITCH, SIDE_THICK, INNER_WIDTH, isHeightValid, getUnitWidth 
} from "./constants";
import { styles } from "./styles";
import { 
  WoodShelf, OuterSteelPanel, VerticalWoodPanel, ComplexColumn, CabinetLight, Dimensions,
  AccessoryDoubleDoor, AccessoryFlipDoor, AccessorySpeaker, AccessoryShelf,
  WoodMaterialVertical 
} from "./ConfigAssets";

// --- Helper: ID기반 고정 난수 생성기 ---
// ID가 같으면 항상 같은 숫자를 반환합니다. (플리커링 방지)
const getDeterministicRandom = (seedStr) => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
};

export const GlobalSelectionMarker = ({ x, y, visible }) => {
  const meshRef = useRef();
  const { position, scale } = useSpring({
    position: [x, y + 0.18, 0],
    scale: visible ? 1 : 0,
    config: { mass: 1, tension: 170, friction: 26 }
  });

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.position.y = Math.sin(t * 2) * 0.02; 
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

const CellSpace = ({ width, height, position, accessoryData, activeTool, isValid, onInteract }) => {
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
      {accessoryData?.type === "door-double" && <AccessoryDoubleDoor width={width} height={height} />}
      {accessoryData?.type === "door-flip" && <AccessoryFlipDoor width={width} height={height} />}
      {accessoryData?.type === "speaker" && <AccessorySpeaker width={width} height={height} />}
      {accessoryData?.type === "shelf" && (
        <group>
          {Array.from({ length: accessoryData.count || 1 }).map((_, i) => (
            <AccessoryShelf key={i} width={width} position={[0, -height/2 + (height/((accessoryData.count||1)+1))*(i+1), 0]} />
          ))}
        </group>
      )}
    </group>
  );
};

const BlockAssembler = ({ width, rows, columns, unitId, blockId, accessories, activeTool, onCellClick, isNightMode }) => {
  let currentY = 0;
  const elements = [];
  
  const totalH = rows.reduce((acc, h) => acc + (h||0), 0) + (rows.length + 1) * WOOD_THICK;
  
  // [1. Back Panel] ID 기반 고정 시드 사용
  const backPanelSeed = getDeterministicRandom(`${unitId}-${blockId}-back`);

  elements.push(
    <mesh key="back" position={[0, totalH/2, -DEPTH/2]} castShadow receiveShadow>
      <boxGeometry args={[width, totalH, 0.005]} />
      <WoodMaterialVertical seed={backPanelSeed} /> 
    </mesh>
  );

  // [2. Base]
  elements.push(<WoodShelf key="base" width={width} position={[0, WOOD_THICK/2, 0]} seed={getDeterministicRandom(`${unitId}-${blockId}-base`)} />);
  currentY += WOOD_THICK;

  const nodeXArr = Array.from({ length: columns + 1 }, (_, i) => -width/2 + DICE_SIZE/2 + i * COLUMN_PITCH);

  // [3. Rows]
  rows.forEach((h, rIdx) => {
    if (!h) return;
    const isRowValid = activeTool ? isHeightValid(activeTool, h) : false;
    
    elements.push(
      <group key={`row-${rIdx}`} position={[0, currentY + h/2, 0]}>
        {nodeXArr.map((x, i) => (
          <group key={`col-${i}`}>
            <ComplexColumn height={h} position={[x, 0, DEPTH/2 - DICE_SIZE/2]} />
            <ComplexColumn height={h} position={[x, 0, -(DEPTH/2 - DICE_SIZE/2)]} />
          </group>
        ))}
        {nodeXArr.map((x, i) => {
           const panelSeed = getDeterministicRandom(`${unitId}-${blockId}-${rIdx}-panel-${i}`);
           if(i===0) return <group key={`p-${i}`}><OuterSteelPanel height={h} position={[x - DICE_SIZE/2 - SIDE_THICK/2, 0, 0]} /><VerticalWoodPanel height={h} position={[x + DICE_SIZE/2 + WOOD_THICK/2, 0, 0]} seed={panelSeed} /></group>;
           if(i===columns) return <group key={`p-${i}`}><VerticalWoodPanel height={h} position={[x - DICE_SIZE/2 - WOOD_THICK/2, 0, 0]} seed={panelSeed} /><OuterSteelPanel height={h} position={[x + DICE_SIZE/2 + SIDE_THICK/2, 0, 0]} /></group>;
           return <group key={`p-${i}`}><VerticalWoodPanel height={h} position={[x - DICE_SIZE/2 - WOOD_THICK/2, 0, 0]} seed={panelSeed} /><VerticalWoodPanel height={h} position={[x + DICE_SIZE/2 + WOOD_THICK/2, 0, 0]} seed={panelSeed} /></group>;
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
            />
          );
        })}
      </group>
    );
    currentY += h;
    // [Top Shelf]
    elements.push(<WoodShelf key={`top-${rIdx}`} width={width} position={[0, currentY + WOOD_THICK/2, 0]} seed={getDeterministicRandom(`${unitId}-${blockId}-${rIdx}-top`)} />);
    currentY += WOOD_THICK;
  });
  return <group>{elements}</group>;
};

export const UnitAssembler = ({ unit, position, showDimensions, showNames, isSelected, label, activeTool, onCellClick, isNightMode, onUnitClick }) => {
  const currentWidth = getUnitWidth(unit.columns);
  const totalHeight = unit.blocks.reduce((acc, b) => acc + b.rows.reduce((r, h) => r + h + WOOD_THICK, 0) + WOOD_THICK, 0);
  const [hovered, setHover] = useState(false);
  useCursor(hovered && !activeTool);
  
  const { scale, posY } = useSpring({
    from: { scale: 0.9, posY: 0.2 }, 
    to: { scale: 1, posY: 0 },
    config: { mass: 2, tension: 50, friction: 40, clamp: true } 
  });

  let curY = 0;
  return (
    <animated.group 
      position-x={position[0]}
      position-z={position[2]}
      position-y={posY}
      scale={scale}
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
      <mesh visible={false} position={[0, totalHeight/2, 0]}><boxGeometry args={[currentWidth + 0.1, totalHeight, DEPTH + 0.1]} /></mesh>
      {unit.blocks.map(block => {
        const h = block.rows.reduce((a, b) => a + b + WOOD_THICK, 0) + WOOD_THICK;
        const el = <group key={block.id} position={[0, curY, 0]}><BlockAssembler width={currentWidth} rows={block.rows} columns={unit.columns} unitId={unit.id} blockId={block.id} accessories={unit.accessories} activeTool={activeTool} onCellClick={onCellClick} isNightMode={isNightMode} /></group>;
        curY += h;
        return el;
      })}
      <Dimensions width={currentWidth} height={totalHeight} visible={showDimensions && (hovered || isSelected)} />
      {showNames && !(showDimensions && (hovered || isSelected)) && <Html position={[0, -0.25, 0]} center zIndexRange={[60, 0]}><div style={styles.furnitureTag}>{label}</div></Html>}
    </animated.group>
  );
};