import React, { useState, useLayoutEffect } from 'react';
import { Edges } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import UnitRenderer from '../space/UnitRenderer'; // 경로 확인 필요
import { getItemDimensions } from '../../utils/spaceUtils';

export default function Zone2Custom({ item, isSelected, isDragging, onClick, isLightOn, onSizeChange, children }) {
  const [displaySize, setDisplaySize] = useState([1, 1, 1]); 
  const [centerOffset, setCenterOffset] = useState([0, 0.5, 0]);

  useLayoutEffect(() => {
    if (isDragging) return;
    const dims = getItemDimensions(item);
    setDisplaySize([dims.w, dims.h, dims.d]);
    setCenterOffset([0, dims.h / 2, 0]);
    if(onSizeChange) onSizeChange(item.uid, { width: dims.w, height: dims.h, depth: dims.d });
  }, [item, isDragging]); 

  const { springScale, springY, springRot } = useSpring({
    springScale: isDragging ? 1.02 : 1,
    springY: isDragging ? 0.2 : 0, 
    springRot: isDragging ? 0.02 : 0, 
    config: { mass: 1, tension: 400, friction: 30 }
  });

  return (
    <animated.group position-x={item.position[0]} position-z={item.position[2]} position-y={springY} rotation={item.rotation} rotation-z={springRot} scale={springScale} onClick={onClick}>
      {children}
      <group>
         {item.configData && item.configData.map((unitData, idx) => (
           <group key={idx}><UnitRenderer unit={unitData} isLightOn={isLightOn} /></group>
         ))}
      </group>
      {isSelected && (
        <mesh position={centerOffset}>
          <boxGeometry args={displaySize} /> 
          <meshBasicMaterial visible={false} />
          <Edges scale={1} threshold={30} color="white" renderOrder={1000} opacity={0.8} />
        </mesh>
      )}
      <mesh position={centerOffset} visible={false}><boxGeometry args={displaySize} /></mesh>
      <animated.mesh position={[0, -springY, 0]} rotation={[-Math.PI/2, 0, 0]} position-y={springY.to(y => -y + 0.005)}>
        <planeGeometry args={[displaySize[0] + 0.1, displaySize[2] + 0.1]} /> 
        <animated.meshBasicMaterial color="#000" opacity={springY.to(y => y * 0.3)} transparent depthWrite={false} />
      </animated.mesh>
    </animated.group>
  );
}