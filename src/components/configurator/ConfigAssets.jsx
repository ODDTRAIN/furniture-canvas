import React, { useMemo } from "react";
import * as THREE from "three";
import { Html, useTexture, RoundedBox, useGLTF } from "@react-three/drei";
import { DEPTH, WOOD_THICK, SIDE_THICK, DICE_SIZE, PIPE_RADIUS, FILLET } from "./constants";
import { styles } from "./styles";

// --- Helper: Texture Loader (안전장치 포함) ---
const useConfiguredTexture = (mapsObject, repeatX = 1, repeatY = 1, rotate = false, seed = 0) => {
  const validMaps = useMemo(() => {
    const result = {};
    Object.keys(mapsObject).forEach((key) => { if (mapsObject[key]) result[key] = mapsObject[key]; });
    return result;
  }, [JSON.stringify(mapsObject)]);
  
  const textures = useTexture(validMaps);
  
  return useMemo(() => {
    const configured = {};
    if (!textures || Object.keys(textures).length === 0) return configured;

    const textureMap = textures;
    
    // 난수 오프셋 (결 랜덤화)
    const randomOffsetX = seed ? (seed * 12.34) % 1 : 0;
    const randomOffsetY = seed ? (seed * 56.78) % 1 : 0;

    Object.keys(textureMap).forEach((key) => {
      const tex = textureMap[key].clone();
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
      
      // 색상 보정
      if (key === 'map') {
        tex.colorSpace = THREE.SRGBColorSpace;
      }
      
      tex.needsUpdate = true;
      configured[key] = tex;
    });
    return configured;
  }, [textures, repeatX, repeatY, rotate, seed]);
};

// --- Materials ---

// [월넛] 표면용 - 가로결 (상판, 선반)
// 수정됨: roughness 0.5 -> 0.85 (매트하게), envMapIntensity 0.2 (반사광 억제)
export const WoodMaterialHorizontal = (props) => { 
  const t = useConfiguredTexture({ map: "/textures/walnut_DIFFUSE.jpg", normalMap: "/textures/walnut_NORMAL.jpg" }, 3, 1, true, props.seed); 
  return <meshStandardMaterial {...props} {...t} color="#ffffff" roughness={0.85} metalness={0.0} envMapIntensity={0.2} />; 
};

// [월넛] 표면용 - 세로결 (옆판)
// 수정됨: roughness 0.5 -> 0.85 (매트하게), envMapIntensity 0.2 (반사광 억제)
export const WoodMaterialVertical = (props) => { 
  const t = useConfiguredTexture({ map: "/textures/walnut_DIFFUSE.jpg", normalMap: "/textures/walnut_NORMAL.jpg" }, 2, 1, false, props.seed); 
  return <meshStandardMaterial {...props} {...t} color="#ffffff" roughness={0.85} metalness={0.0} envMapIntensity={0.2} />; 
};

// [자작나무 엣지] 
// 엣지는 약간 더 단단한 느낌을 위해 roughness 0.8 유지
export const BirchEdgeMaterialHorizontal = (props) => { 
  const t = useConfiguredTexture({ map: "/textures/birch_edge.jpg", normalMap: "/textures/birch_edge_NORMAL.jpg" }, 0.1, 0.12, false, props.seed); 
  return <meshStandardMaterial {...props} {...t} color="#ccc" roughness={0.8} metalness={0.0} />; 
};

export const BirchEdgeMaterialVertical = (props) => { 
  const t = useConfiguredTexture({ map: "/textures/birch_edge.jpg", normalMap: "/textures/birch_edge_NORMAL.jpg" }, 0.1, 0.12, true, props.seed); 
  return <meshStandardMaterial {...props} {...t} color="#ccc" roughness={0.8} metalness={0.0} />; 
};

// [크롬] 스테인리스
export const ChromeMaterial = (props) => { 
  const t = useConfiguredTexture({ normalMap: "/textures/Poliigon_MetalSteelBrushed_7174_Normal.png", roughnessMap: "/textures/Poliigon_MetalSteelBrushed_7174_Roughness.jpg" }, 1.3, 2, true); 
  return <meshStandardMaterial {...props} {...t} color="#ffffff" roughness={0.4} metalness={1.0} envMapIntensity={1.6} />; 
};

// --- Parts ---
export const DiceModel = () => {
  const { nodes } = useGLTF("/models/dice25mm.glb");
  const mesh = Object.values(nodes).find((n) => n.isMesh);
  if (!mesh) return null;
  return <mesh geometry={mesh.geometry} castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} scale={0.01}><ChromeMaterial /></mesh>;
};
useGLTF.preload("/models/dice25mm.glb");

// [가로판] WoodShelf
export const WoodShelf = ({ width, position, seed }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={[width - 0.001, WOOD_THICK, DEPTH - 0.001]} />
    <BirchEdgeMaterialHorizontal attach="material-0" seed={seed} />
    <BirchEdgeMaterialHorizontal attach="material-1" seed={seed} />
    <WoodMaterialHorizontal attach="material-2" seed={seed} />
    <WoodMaterialHorizontal attach="material-3" seed={seed} />
    <BirchEdgeMaterialHorizontal attach="material-4" seed={seed} />
    <BirchEdgeMaterialHorizontal attach="material-5" seed={seed} />
  </mesh>
);

export const OuterSteelPanel = ({ height, position }) => (<mesh position={position} castShadow receiveShadow><boxGeometry args={[SIDE_THICK, height, DEPTH - 0.002]} /><ChromeMaterial /></mesh>);

// [세로판] VerticalWoodPanel
export const VerticalWoodPanel = ({ height, position, seed }) => (
  <mesh position={position} castShadow receiveShadow>
    <boxGeometry args={[WOOD_THICK, height, DEPTH - 0.002]} />
    <WoodMaterialVertical attach="material-0" seed={seed} />
    <WoodMaterialVertical attach="material-1" seed={seed} />
    <BirchEdgeMaterialVertical attach="material-2" seed={seed} />
    <BirchEdgeMaterialVertical attach="material-3" seed={seed} />
    <BirchEdgeMaterialVertical attach="material-4" seed={seed} />
    <BirchEdgeMaterialVertical attach="material-5" seed={seed} />
  </mesh>
);

export const ComplexColumn = ({ height, position }) => (<group position={position}><group position={[0, -height/2+DICE_SIZE/2, 0]}><DiceModel /></group><mesh position={[0, 0, 0]} castShadow><cylinderGeometry args={[PIPE_RADIUS, PIPE_RADIUS, height-DICE_SIZE*2, 32]} /><ChromeMaterial /></mesh><group position={[0, height/2-DICE_SIZE/2, 0]}><DiceModel /></group></group>);

// --- Accessories ---
export const AccessoryDoubleDoor = ({ width, height }) => {
  const w = (width - 0.005) / 2;
  const h = height - 0.004;
  const Panel = ({x}) => (<mesh position={[x, 0, 0]} castShadow receiveShadow><boxGeometry args={[w, h, WOOD_THICK]} /><BirchEdgeMaterialVertical attach="material-0"/><BirchEdgeMaterialVertical attach="material-1"/><BirchEdgeMaterialHorizontal attach="material-2"/><BirchEdgeMaterialHorizontal attach="material-3"/><WoodMaterialVertical attach="material-4"/><WoodMaterialVertical attach="material-5"/></mesh>);
  return <group position={[0, 0, DEPTH/2]}><Panel x={-(w+0.005)/2} /><Panel x={(w+0.005)/2} /></group>;
};
export const AccessoryFlipDoor = ({ width, height }) => (<group position={[0, 0, DEPTH/2]}><group rotation={[-0.15, 0, 0]}><mesh castShadow receiveShadow><boxGeometry args={[width-0.004, height-0.004, WOOD_THICK]} /><BirchEdgeMaterialVertical attach="material-0"/><BirchEdgeMaterialVertical attach="material-1"/><BirchEdgeMaterialHorizontal attach="material-2"/><BirchEdgeMaterialHorizontal attach="material-3"/><WoodMaterialVertical attach="material-4"/><WoodMaterialVertical attach="material-5"/></mesh><mesh position={[0, -(height-0.004)/2+0.01, WOOD_THICK/2+0.005]} castShadow><boxGeometry args={[width-0.004, 0.02, 0.01]} /><ChromeMaterial /></mesh></group></group>);
export const AccessorySpeaker = ({ width, height }) => (<group position={[0, 0, DEPTH/2]}><mesh castShadow receiveShadow><RoundedBox args={[width+DICE_SIZE*3, height+DICE_SIZE, WOOD_THICK]} radius={FILLET} smoothness={4}><WoodMaterialVertical /></RoundedBox></mesh><mesh position={[0, 0.05, WOOD_THICK/2]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.01, 32]} /><meshStandardMaterial color="#222" /></mesh><mesh position={[0, -0.1, WOOD_THICK/2]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 0.01, 32]} /><meshStandardMaterial color="#000" /></mesh></group>);
export const AccessoryShelf = ({ width, position }) => (<mesh position={position} castShadow receiveShadow><RoundedBox args={[width-0.002, 0.015, 0.284]} radius={FILLET} smoothness={4}><WoodMaterialHorizontal /></RoundedBox></mesh>);
export const CabinetLight = ({ width, position }) => (<group position={position}><pointLight color="#ffb74d" intensity={12} distance={0.8} decay={2} position={[0, -0.02, 0]} /><mesh position={[0, 0.0025, 0]}><boxGeometry args={[width-0.04, 0.005, 0.01]} /><meshBasicMaterial color="#ffebb3" toneMapped={false} /></mesh></group>);

export const Dimensions = ({ width, height, visible }) => {
  if (!visible) return null;
  return (
    <group>
      <Html position={[0, -0.18, 0]} center zIndexRange={[100, 0]}>
        <div style={styles.dimPill}>{Math.round(width * 1000)}mm</div>
      </Html>
      <Html position={[width / 2 + 0.18, height / 2, 0]} center zIndexRange={[100, 0]}>
        <div style={styles.dimPill}>{Math.round(height * 1000)}mm</div>
      </Html>
    </group>
  );
};