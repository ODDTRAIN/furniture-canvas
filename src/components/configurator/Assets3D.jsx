import React, { useMemo } from "react";
import * as THREE from "three";
import { Html, useTexture, RoundedBox, useGLTF } from "@react-three/drei";
import { DEPTH, WOOD_THICK, SIDE_THICK, DICE_SIZE, PIPE_RADIUS, FILLET } from "./constants";

// --- Helper: Texture Loader ---
const useConfiguredTexture = (mapsObject, repeatX = 1, repeatY = 1, rotate = false) => {
  const validMaps = useMemo(() => {
    const result = {};
    Object.keys(mapsObject).forEach((key) => { if (mapsObject[key]) result[key] = mapsObject[key]; });
    return result;
  }, [JSON.stringify(mapsObject)]);
  
  const textures = useTexture(validMaps);
  return useMemo(() => {
    const configured = {};
    if (!textures) return configured;
    const textureMap = textures instanceof THREE.Texture ? { map: textures } : textures;
    Object.keys(textureMap).forEach((key) => {
      const tex = textureMap[key].clone();
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeatX, repeatY);
      if (rotate) { tex.center.set(0.5, 0.5); tex.rotation = Math.PI / 2; }
      else { tex.center.set(0, 0); tex.rotation = 0; }
      tex.needsUpdate = true;
      configured[key] = tex;
    });
    return configured;
  }, [textures, repeatX, repeatY, rotate]);
};

// --- Materials ---
export const WoodMaterialHorizontal = (props) => { const t = useConfiguredTexture({ map: "/textures/walnut_DIFFUSE.jpg", normalMap: "/textures/walnut_NORMAL.jpg" }, 2, 1, true); return <meshStandardMaterial {...props} {...t} roughness={0.5} metalness={0.0} />; };
export const WoodMaterialVertical = (props) => { const t = useConfiguredTexture({ map: "/textures/walnut_DIFFUSE.jpg", normalMap: "/textures/walnut_NORMAL.jpg" }, 2, 1, false); return <meshStandardMaterial {...props} {...t} roughness={0.5} metalness={0.0} />; };
export const BirchEdgeMaterialHorizontal = (props) => { const t = useConfiguredTexture({ map: "/textures/birch_edge.jpg", normalMap: "/textures/birch_edge_NORMAL.jpg" }, 0.3, 1, false); return <meshStandardMaterial {...props} {...t} color="#fff" roughness={0.6} metalness={0.0} />; };
export const BirchEdgeMaterialVertical = (props) => { const t = useConfiguredTexture({ map: "/textures/birch_edge.jpg", normalMap: "/textures/birch_edge_NORMAL.jpg" }, 0.3, 1, true); return <meshStandardMaterial {...props} {...t} color="#fff" roughness={0.6} metalness={0.0} />; };
export const ChromeMaterial = (props) => { const t = useConfiguredTexture({ normalMap: "/textures/Poliigon_MetalSteelBrushed_7174_Normal.png", roughnessMap: "/textures/Poliigon_MetalSteelBrushed_7174_Roughness.jpg" }, 1.3, 2, true); return <meshStandardMaterial {...props} {...t} color="#fff" roughness={0.7} metalness={0.9} envMapIntensity={1} />; };

// --- Parts ---
export const DiceModel = () => {
  const { nodes } = useGLTF("/models/dice25mm.glb");
  const mesh = Object.values(nodes).find((n) => n.isMesh);
  if (!mesh) return null;
  return <mesh geometry={mesh.geometry} castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]} scale={0.01}><ChromeMaterial /></mesh>;
};
useGLTF.preload("/models/dice25mm.glb");

export const WoodShelf = ({ width, position }) => (<mesh position={position} castShadow receiveShadow><boxGeometry args={[width - 0.001, WOOD_THICK, DEPTH - 0.001]} /><BirchEdgeMaterialHorizontal attach="material-0" /><BirchEdgeMaterialHorizontal attach="material-1" /><WoodMaterialHorizontal attach="material-2" /><WoodMaterialHorizontal attach="material-3" /><BirchEdgeMaterialHorizontal attach="material-4" /><BirchEdgeMaterialHorizontal attach="material-5" /></mesh>);
export const OuterSteelPanel = ({ height, position }) => (<mesh position={position} castShadow receiveShadow><boxGeometry args={[SIDE_THICK, height, DEPTH - 0.002]} /><ChromeMaterial /></mesh>);
export const VerticalWoodPanel = ({ height, position }) => (<mesh position={position} castShadow receiveShadow><boxGeometry args={[WOOD_THICK, height, DEPTH - 0.002]} /><WoodMaterialVertical attach="material-0" /><WoodMaterialVertical attach="material-1" /><BirchEdgeMaterialVertical attach="material-2" /><BirchEdgeMaterialVertical attach="material-3" /><BirchEdgeMaterialVertical attach="material-4" /><BirchEdgeMaterialVertical attach="material-5" /></mesh>);
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
export const CabinetLight = ({ width, position }) => (<group position={position}><pointLight color="#ffb74d" intensity={8} distance={0.8} decay={2} position={[0, -0.02, 0]} /><mesh position={[0, 0.0025, 0]}><boxGeometry args={[width-0.04, 0.005, 0.01]} /><meshBasicMaterial color="#ffebb3" toneMapped={false} /></mesh></group>);

// --- Dimensions Component ---
// 스타일은 여기서 직접 정의하여 순환 참조를 방지합니다.
const dimStyle = { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", padding: "6px 12px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", boxShadow: "0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)", whiteSpace: "nowrap", letterSpacing: "0.02em", color: "#1d1d1f" };

export const Dimensions = ({ width, height, visible }) => {
  if (!visible) return null;
  return (
    <group>
      <Html position={[0, -0.18, 0]} center zIndexRange={[100, 0]}>
        <div style={dimStyle}>{Math.round(width * 1000)}mm</div>
      </Html>
      <Html position={[width / 2 + 0.18, height / 2, 0]} center zIndexRange={[100, 0]}>
        <div style={dimStyle}>{Math.round(height * 1000)}mm</div>
      </Html>
    </group>
  );
};