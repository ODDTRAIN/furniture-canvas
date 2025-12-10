import React from 'react';
import { Edges, Text } from '@react-three/drei';

export default function PropBox({ item, isSelected, updateItemName }) {
  const textColor = isSelected ? "white" : "rgba(255,255,255,0.6)";
  
  const handleDoubleClick = (e) => {
    e.stopPropagation();
    const newName = window.prompt("What is this object?", item.name);
    if (newName) {
      updateItemName(item.uid, newName);
    }
  };

  return (
    // [Check] 1m 높이 박스의 중심을 0.5 올려서 바닥(0)에 맞춤
    <group onDoubleClick={handleDoubleClick} position={[0, 0.5, 0]}>
      {/* 1. Wireframe Box */}
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent opacity={0.1} color={isSelected ? "#007AFF" : "#888"} depthWrite={false} />
        <Edges scale={1} threshold={15} color={isSelected ? "#007AFF" : "#666"} />
      </mesh>

      {/* 2. Floating Text Label */}
      <group>
        <Text position={[0, 0, 0.51]} fontSize={0.15} color={textColor} anchorX="center" anchorY="middle" maxWidth={0.9}>
          {item.name}
        </Text>
        <Text position={[0, 0, -0.51]} rotation={[0, Math.PI, 0]} fontSize={0.15} color={textColor} anchorX="center" anchorY="middle" maxWidth={0.9}>
          {item.name}
        </Text>
      </group>

      {!item.name && (
        <Text position={[0, 0.2, 0]} fontSize={0.3} color={textColor}>?</Text>
      )}
    </group>
  );
}