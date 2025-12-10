import React, { useState, useLayoutEffect } from 'react';
import { Edges } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';

export default function ColumnItem({ item, isSelected, isDragging, onClick, roomHeight, children }) {
  const [displaySize, setDisplaySize] = useState([1, 1, 1]); 
  const [centerOffset, setCenterOffset] = useState([0, 0.5, 0]);

  useLayoutEffect(() => {
    const h = roomHeight + 0.1; 
    setDisplaySize([item.width, h, item.depth]);
    setCenterOffset([0, h / 2, 0]);
  }, [item, roomHeight]); 

  const { springScale, springY } = useSpring({
    springScale: isDragging ? 1.01 : 1,
    springY: isDragging ? 0.05 : 0, 
    config: { mass: 1, tension: 400, friction: 30 }
  });

  return (
    <animated.group position-x={item.position[0]} position-z={item.position[2]} position-y={springY} rotation={item.rotation} scale={springScale} onClick={onClick}>
      {children}
      <mesh position={[0, (roomHeight+0.1)/2, 0]} castShadow receiveShadow>
        <boxGeometry args={[item.width, roomHeight + 0.1, item.depth]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
      </mesh>
      {isSelected && (
        <mesh position={centerOffset}>
          <boxGeometry args={displaySize} /> 
          <meshBasicMaterial visible={false} />
          <Edges scale={1} threshold={30} color="white" renderOrder={1000} opacity={0.8} />
        </mesh>
      )}
    </animated.group>
  );
}