import React, { useMemo } from "react";
import * as THREE from "three";
import { Html, useTexture, useGLTF, Line, Edges } from "@react-three/drei"; // [추가] Edges import
import { DEPTH, WOOD_THICK, SIDE_THICK, DICE_SIZE, PIPE_RADIUS, FILLET, LEG_HEIGHT } from "./constants";
import { styles } from "./styles";

// --- 텍스처 경로 상수 ---
const WALNUT_MAPS = {
  map: "/textures/walnut_DIFFUSE.jpg",
  normalMap: "/textures/walnut_NORMAL.jpg"
};

const BIRCH_MAPS = {
  map: "/textures/birch_edge.jpg",
  normalMap: "/textures/birch_edge_NORMAL.jpg"
};

const CHROME_MAPS = {
  normalMap: "/textures/Poliigon_MetalSteelBrushed_7174_Normal.png",
  roughnessMap: "/textures/Poliigon_MetalSteelBrushed_7174_Roughness.jpg"
};

// --- Helper: Texture Loader ---
const useConfiguredTexture = (mapsObject, repeatX = 1, repeatY = 1, rotate = false, seed = 0) => {
  const textures = useTexture(mapsObject);
  
  return useMemo(() => {
    const configured = {};
    const randomOffsetX = seed ? (seed * 12.34) % 1 : 0;
    const randomOffsetY = seed ? (seed * 56.78) % 1 : 0;

    Object.keys(textures).forEach((key) => {
      const tex = textures[key].clone();
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeatX, repeatY);
      tex.offset.set(randomOffsetX, randomOffsetY);

      if (rotate) { 
        tex.center.set(0.5, 0.5); 
        tex.rotation = Math.PI / 2; 
      } else { 
        tex.center.set(0, 0); 
        tex.rotation = 0; 
      }
      
      if (key === 'map') {
        tex.colorSpace = THREE.SRGBColorSpace;
      }
      
      tex.needsUpdate = true;
      configured[key] = tex;
    });
    return configured;
  }, [textures, repeatX, repeatY, rotate, seed]);
};

// --- [TUNED] Emissive Settings (강도 UP) ---
const getEmissiveSettings = (highlightState) => {
  if (highlightState === 'row') {
    // [강조] Row 선택: 아주 밝은 빛 + ToneMapping 끔
    return { emissive: "#FFFFFF", emissiveIntensity: 1.5, toneMapped: false };
  } else if (highlightState === 'stack') {
    // [은은] Stack 선택
    return { emissive: "#404040", emissiveIntensity: 0.5, toneMapped: false };
  }
  return { emissive: "black", emissiveIntensity: 0, toneMapped: true };
};

// --- [NEW] Highlight Edge Component ---
// 선택된 상태일 때만 외곽선을 그려주는 헬퍼 컴포넌트
const HighlightEdges = ({ state }) => {
  if (!state) return null;
  // Row 선택 시 흰색, Stack 선택 시 회색
  const color = state === 'row' ? "white" : "#666666"; 
  const opacity = state === 'row' ? 1.0 : 0.5;
  // threshold={15}: 15도 이상 꺾이는 모서리에만 선을 그림 (곡면의 지저분한 선 방지)
  return <Edges threshold={15} color={color} transparent opacity={opacity} renderOrder={1000} />;
};

// --- Materials ---
export const WoodMaterialHorizontal = (props) => { 
  const t = useConfiguredTexture(WALNUT_MAPS, 3, 1, true, props.seed); 
  const em = getEmissiveSettings(props.isHighlighted);
  return <meshStandardMaterial {...props} {...t} color="#ffffff" roughness={0.85} metalness={0.0} envMapIntensity={0.2} {...em} />; 
};

export const WoodMaterialVertical = (props) => { 
  const t = useConfiguredTexture(WALNUT_MAPS, 2, 1, false, props.seed); 
  const em = getEmissiveSettings(props.isHighlighted);
  return <meshStandardMaterial {...props} {...t} color="#ffffff" roughness={0.85} metalness={0.0} envMapIntensity={0.2} {...em} />; 
};

export const BirchEdgeMaterialHorizontal = (props) => { 
  const t = useConfiguredTexture(BIRCH_MAPS, 0.1, 8, false, props.seed); 
  const em = getEmissiveSettings(props.isHighlighted);
  return <meshStandardMaterial {...props} {...t} color="#ccc" roughness={0.8} metalness={0.0} {...em} />; 
};

export const BirchEdgeMaterialVertical = (props) => { 
  const t = useConfiguredTexture(BIRCH_MAPS, 0.5, 8, false, props.seed); 
  const em = getEmissiveSettings(props.isHighlighted);
  return <meshStandardMaterial {...props} {...t} color="#ccc" roughness={0.8} metalness={0.0} {...em} />; 
};

export const ChromeMaterial = (props) => { 
  const t = useConfiguredTexture(CHROME_MAPS, 1.3, 2, true); 
  const em = getEmissiveSettings(props.isHighlighted);
  const chromeEm = props.isHighlighted === 'row' 
    ? { emissive: "#404040", emissiveIntensity: 0.5, toneMapped: false } 
    : (props.isHighlighted === 'stack' ? { emissive: "#202020", emissiveIntensity: 0.3, toneMapped: false } : em);

  return <meshStandardMaterial {...props} {...t} color="#ffffff" roughness={0.5} metalness={0.95} envMapIntensity={1.6} {...chromeEm} />; 
};

// --- Parts ---
export const DiceModel = () => {
  const { nodes } = useGLTF("/models/dice25mm.glb");
  const mesh = Object.values(nodes).find((n) => n.isMesh);
  if (!mesh) return null;
  return <mesh geometry={mesh.geometry} castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} scale={0.01}><ChromeMaterial /></mesh>;
};
useGLTF.preload("/models/dice25mm.glb");

// --- FilletBoard: Flush Fit + Edge Highlighting ---
const FilletBoard = ({ width, height, thickness, position, rotation, seed, isVertical, isHighlighted }) => {
  const bevelSize = 0.0006; 
  const veneerTotalThick = 0.001; 
  
  const coreShape = useMemo(() => {
    const s = new THREE.Shape();
    const w = width; 
    const h = height;
    s.moveTo(-w/2, -h/2);
    s.lineTo(w/2, -h/2);
    s.lineTo(w/2, h/2);
    s.lineTo(-w/2, h/2);
    s.lineTo(-w/2, -h/2);
    return s;
  }, [width, height]);

  const veneerShape = useMemo(() => {
    const s = new THREE.Shape();
    const w = width - bevelSize * 2; 
    const h = height - bevelSize * 2;
    s.moveTo(-w/2, -h/2);
    s.lineTo(w/2, -h/2);
    s.lineTo(w/2, h/2);
    s.lineTo(-w/2, h/2);
    s.lineTo(-w/2, -h/2);
    return s;
  }, [width, height]);

  const coreSettings = useMemo(() => ({
    depth: thickness - veneerTotalThick * 2, 
    bevelEnabled: false, 
  }), [thickness]);

  const veneerSettings = useMemo(() => ({
    depth: veneerTotalThick - bevelSize, 
    bevelEnabled: true,
    bevelSegments: 2, 
    bevelSize: bevelSize,
    bevelThickness: bevelSize,
    curveSegments: 2
  }), []);

  const zOffset = -thickness / 2;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0, zOffset + veneerTotalThick]} castShadow receiveShadow>
        <extrudeGeometry args={[coreShape, coreSettings]} />
        {isVertical 
          ? <BirchEdgeMaterialVertical attach="material" seed={seed} isHighlighted={isHighlighted} /> 
          : <BirchEdgeMaterialHorizontal attach="material" seed={seed} isHighlighted={isHighlighted} />
        }
        {/* [NEW] 엣지 라인 추가 */}
        <HighlightEdges state={isHighlighted} />
      </mesh>
      <mesh position={[0, 0, zOffset + thickness - veneerTotalThick]} castShadow receiveShadow>
        <extrudeGeometry args={[veneerShape, veneerSettings]} />
        {isVertical 
          ? <WoodMaterialVertical attach="material" seed={seed} isHighlighted={isHighlighted} /> 
          : <WoodMaterialHorizontal attach="material" seed={seed} isHighlighted={isHighlighted} />
        }
        <HighlightEdges state={isHighlighted} />
      </mesh>
      <mesh position={[0, 0, zOffset + veneerTotalThick]} scale={[1, 1, -1]} castShadow receiveShadow>
        <extrudeGeometry args={[veneerShape, veneerSettings]} />
        {isVertical 
          ? <WoodMaterialVertical attach="material" seed={seed} isHighlighted={isHighlighted} /> 
          : <WoodMaterialHorizontal attach="material" seed={seed} isHighlighted={isHighlighted} />
        }
        <HighlightEdges state={isHighlighted} />
      </mesh>
    </group>
  );
};

// --- UnitLeg: With Highlight Edge ---
export const UnitLeg = ({ position, isHighlighted }) => {
  return (
    <mesh position={position} castShadow receiveShadow>
      <cylinderGeometry args={[0.01, 0.01, LEG_HEIGHT, 32]} />
      <ChromeMaterial isHighlighted={isHighlighted} />
      {/* 원기둥 엣지 추가 */}
      <HighlightEdges state={isHighlighted} />
    </mesh>
  );
};

// --- Components (Highlight Edges Propagated) ---
export const WoodShelf = ({ width, position, seed, isHighlighted }) => ( <FilletBoard width={width} height={DEPTH} thickness={WOOD_THICK} position={position} rotation={[-Math.PI / 2, 0, 0]} seed={seed} isVertical={false} isHighlighted={isHighlighted} /> );
export const VerticalWoodPanel = ({ height, position, seed, isHighlighted }) => ( <FilletBoard width={DEPTH} height={height} thickness={WOOD_THICK} position={position} rotation={[0, -Math.PI / 2, 0]} seed={seed} isVertical={true} isHighlighted={isHighlighted} /> );
export const OuterSteelPanel = ({ height, position, isHighlighted }) => ( <mesh position={position} castShadow receiveShadow><boxGeometry args={[SIDE_THICK, height, DEPTH - 0.002]} /><ChromeMaterial isHighlighted={isHighlighted} /><HighlightEdges state={isHighlighted} /></mesh> );
export const ComplexColumn = ({ height, position, isHighlighted }) => (<group position={position}><group position={[0, -height/2+DICE_SIZE/2, 0]}><DiceModel /></group><mesh position={[0, 0, 0]} castShadow><cylinderGeometry args={[PIPE_RADIUS, PIPE_RADIUS, height-DICE_SIZE*2, 32]} /><ChromeMaterial isHighlighted={isHighlighted} /><HighlightEdges state={isHighlighted} /></mesh><group position={[0, height/2-DICE_SIZE/2, 0]}><DiceModel /></group></group>);
export const AccessoryDoubleDoor = ({ width, height, isHighlighted }) => { const w = (width - 0.005) / 2; const h = height - 0.004; return <group position={[0, 0, DEPTH/2]}><FilletBoard width={w} height={h} thickness={WOOD_THICK} position={[-(w+0.005)/2, 0, 0]} rotation={[0, 0, 0]} isVertical={true} isHighlighted={isHighlighted} /><FilletBoard width={w} height={h} thickness={WOOD_THICK} position={[(w+0.005)/2, 0, 0]} rotation={[0, 0, 0]} isVertical={true} isHighlighted={isHighlighted} /></group>; };
export const AccessoryFlipDoor = ({ width, height, isHighlighted }) => ( <group position={[0, 0, DEPTH/2]}><group rotation={[-0.15, 0, 0]}><FilletBoard width={width-0.004} height={height-0.004} thickness={WOOD_THICK} position={[0, 0, 0]} rotation={[0, 0, 0]} isVertical={true} isHighlighted={isHighlighted} /><mesh position={[0, -(height-0.004)/2+0.01, WOOD_THICK/2+0.005]} castShadow><boxGeometry args={[width-0.004, 0.02, 0.01]} /><ChromeMaterial isHighlighted={isHighlighted} /><HighlightEdges state={isHighlighted} /></mesh></group></group> );
export const AccessorySpeaker = ({ width, height, isHighlighted }) => (<group position={[0, 0, DEPTH/2]}><mesh castShadow receiveShadow><boxGeometry args={[width+DICE_SIZE*3, height+DICE_SIZE, WOOD_THICK]} /><WoodMaterialVertical isHighlighted={isHighlighted} /><HighlightEdges state={isHighlighted} /></mesh><mesh position={[0, 0.05, WOOD_THICK/2]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.01, 32]} /><meshStandardMaterial color="#222" /></mesh><mesh position={[0, -0.1, WOOD_THICK/2]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 0.01, 32]} /><meshStandardMaterial color="#000" /></mesh></group>);
export const AccessoryShelf = ({ width, position, isHighlighted }) => ( <FilletBoard width={width-0.002} height={DEPTH} thickness={0.015} position={position} rotation={[-Math.PI/2, 0, 0]} isVertical={false} isHighlighted={isHighlighted} /> );
export const CabinetLight = ({ width, position }) => (<group position={position}><pointLight color="#ffb74d" intensity={12} distance={0.8} decay={2} position={[0, -0.02, 0]} /><mesh position={[0, 0.0025, 0]}><boxGeometry args={[width-0.04, 0.005, 0.01]} /><meshBasicMaterial color="#ffebb3" toneMapped={false} /></mesh></group>);

// --- Dimensions ---
export const Dimensions = ({ width, height, visible }) => {
  if (!visible) return null;

  const padding = 0.06; 
  const color = "black"; 
  const lineWidth = 1; 
  const dotSize = 0.006; 

  const halfW = width / 2;
  const z = DEPTH / 2 + 0.02; 

  const yBase = 0; 
  const yDim = -padding; 

  const xBase = halfW;
  const xDim = halfW + padding;

  const Dot = ({ pos }) => (
    <mesh position={pos}>
      <sphereGeometry args={[dotSize, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );

  return (
    <group>
      <Line points={[[-halfW, yBase, z], [-halfW, yDim, z]]} color={color} lineWidth={lineWidth} />
      <Line points={[[halfW, yBase, z], [halfW, yDim, z]]} color={color} lineWidth={lineWidth} />
      <Line points={[[-halfW, yDim, z], [halfW, yDim, z]]} color={color} lineWidth={lineWidth} />
      
      <Dot pos={[-halfW, yBase, z]} /> 
      <Dot pos={[halfW, yBase, z]} />  
      <Dot pos={[-halfW, yDim, z]} />  
      <Dot pos={[halfW, yDim, z]} />   

      <Html position={[0, yDim - 0.025, z]} center zIndexRange={[100, 0]}>
        <div style={styles.dimPill}>{Math.round(width * 1000)}mm</div>
      </Html>

      <Line points={[[xBase, 0, z], [xDim, 0, z]]} color={color} lineWidth={lineWidth} />
      <Line points={[[xBase, height, z], [xDim, height, z]]} color={color} lineWidth={lineWidth} />
      <Line points={[[xDim, 0, z], [xDim, height, z]]} color={color} lineWidth={lineWidth} />

      <Dot pos={[xBase, 0, z]} />      
      <Dot pos={[xBase, height, z]} /> 
      <Dot pos={[xDim, 0, z]} />       
      <Dot pos={[xDim, height, z]} />  

      <Html position={[xDim + 0.04, height / 2, z]} center zIndexRange={[100, 0]}>
        <div style={styles.dimPill}>{Math.round(height * 1000)}mm</div>
      </Html>
    </group>
  );
};

// [FIX] Preload Textures
useTexture.preload(WALNUT_MAPS);
useTexture.preload(BIRCH_MAPS);
useTexture.preload(CHROME_MAPS);