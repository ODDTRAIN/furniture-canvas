import React from 'react';
import { Grid } from '@react-three/drei';

// [VISUAL UPDATE] Apple-style Tech Grid
export default function StudioRoom(props) {
  
  // 1. 데이터 안전하게 꺼내기
  const roomSize = props.roomSize || { width: 10, depth: 10, height: 3 };
  const width = roomSize.width;
  const depth = roomSize.depth;
  const height = roomSize.height;

  // 2. 벽 데이터
  const activeWalls = props.activeWalls || { back: true, left: true, right: true, front: false };
  const showBack = activeWalls.back;
  const showLeft = activeWalls.left;
  const showRight = activeWalls.right;
  const showFront = activeWalls.front;

  // 3. 기둥 데이터
  const columns = props.columns || [];

  // --- 렌더링 ---
  const wallThickness = 0.2; 

  let backWallWidth = width;
  let backWallX = 0;
  if (showLeft) { backWallWidth += wallThickness; backWallX -= wallThickness / 2; }
  if (showRight) { backWallWidth += wallThickness; backWallX += wallThickness / 2; }

  let frontWallWidth = width;
  let frontWallX = 0;
  if (showLeft) { frontWallWidth += wallThickness; frontWallX -= wallThickness / 2; }
  if (showRight) { frontWallWidth += wallThickness; frontWallX += wallThickness / 2; }

  const embedDepth = 0.25; 
  const totalWallHeight = height + embedDepth;
  const wallPosY = (height / 2) - (embedDepth / 2);

  return (
    <group position={[0, 0, 0]}>
      
      {/* Floor */}
      <mesh receiveShadow position={[0, -wallThickness / 2, 0]}>
        <boxGeometry args={[width, wallThickness, depth]} />
        <meshStandardMaterial color="#f5f5f7" roughness={0.8} /> 
      </mesh>
      
      {/* Walls */}
      {showBack && (
        <mesh receiveShadow position={[backWallX, wallPosY, -depth / 2 - wallThickness / 2]}>
          <boxGeometry args={[backWallWidth, totalWallHeight, wallThickness]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      )}
      {showFront && (
        <mesh receiveShadow position={[frontWallX, wallPosY, depth / 2 + wallThickness / 2]}>
          <boxGeometry args={[frontWallWidth, totalWallHeight, wallThickness]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      )}
      {showLeft && (
        <mesh receiveShadow position={[-width / 2 - wallThickness / 2, wallPosY, 0]}>
          <boxGeometry args={[wallThickness, totalWallHeight, depth]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      )}
      {showRight && (
        <mesh receiveShadow position={[width / 2 + wallThickness / 2, wallPosY, 0]}>
          <boxGeometry args={[wallThickness, totalWallHeight, depth]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      )}

      {columns.map((col) => (
        <mesh key={col.id} receiveShadow castShadow position={[col.x, wallPosY, col.z]}>
          <boxGeometry args={[col.width, totalWallHeight, col.depth]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      ))}

      {/* [DESIGN FIX] 고시인성 테크니컬 그리드 */}
      <Grid 
        infiniteGrid 
        cellSize={0.1}        // 10cm 간격 (디테일)
        sectionSize={1}       // 1m 간격 (큰 구획)
        fadeDistance={30}     // 멀리 자연스럽게 사라짐
        
        // [COLOR] 흰 배경에서도 잘 보이도록 진하게 조정
        sectionColor="#a0a0a0" // 큰 격자: 진한 회색
        cellColor="#d0d0d0"    // 작은 격자: 은은한 회색
        
        sectionThickness={1.2} 
        cellThickness={0.6} 
        position={[0, 0.001, 0]} 
        opacity={0.8} // 투명도 낮춤 (더 선명하게)
      />
    </group>
  );
}