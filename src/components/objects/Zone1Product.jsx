import React, { useState, useRef, useLayoutEffect } from 'react';
import { Html, Edges, Gltf } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';
// Space.jsx에 있던 getItemDimensions 로직을 utils에서 가져옴
import { getItemDimensions } from '../../utils/spaceUtils';

export default function Zone1Product({ item, isSelected, isDragging, onClick, onMenuAction, onSizeChange, children }) {
  const contentRef = useRef();
  const groupRef = useRef();
  const [displaySize, setDisplaySize] = useState([1, 1, 1]); 
  const [centerOffset, setCenterOffset] = useState([0, 0.5, 0]);

  useLayoutEffect(() => {
    // [CRITICAL] 드래그 중 계산 금지
    if (isDragging || !contentRef.current || !groupRef.current) return;

    // --- [RESTORED LOGIC START] ---
    // 파트너님이 만족하셨던 "완벽한 핏" 로직 그대로 복구
    
    // 1. 회전 0도 강제 리셋
    const originalRot = groupRef.current.rotation.clone();
    groupRef.current.rotation.set(0, 0, 0);
    groupRef.current.updateMatrixWorld(true);

    // 2. 순수 메쉬 + Visible 필터링 (유령 박스 제거)
    const box = new THREE.Box3();
    let hasMesh = false;
    contentRef.current.traverse((child) => {
      if (child.isMesh && child.visible) {
        box.expandByObject(child);
        hasMesh = true;
      }
    });
    if (!hasMesh) box.setFromObject(contentRef.current);

    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center); 

    // 3. 로컬 중심점 계산
    let localCenter = new THREE.Vector3(0, size.y / 2, 0);
    localCenter = groupRef.current.worldToLocal(center.clone());

    // 4. 회전 복구
    groupRef.current.rotation.copy(originalRot);
    groupRef.current.updateMatrixWorld(true);

    // 5. 데이터 적용 (1:1 Fit + 미세 Z-fighting 방지)
    if (size.x > 0.01 && size.y > 0.01) {
      const exactW = size.x - 0.001; 
      const exactH = size.y;
      const exactD = size.z - 0.001;
      
      setDisplaySize([exactW, exactH, exactD]);
      setCenterOffset([localCenter.x, size.y / 2, localCenter.z]);
      
      // SmartGizmo에 정확한 중심점(centerOffset) 전달
      if(onSizeChange) {
        onSizeChange(item.uid, { 
            width: exactW, 
            height: exactH, 
            depth: exactD,
            centerOffset: [localCenter.x, size.y / 2, localCenter.z]
        });
      }
    }
    // --- [RESTORED LOGIC END] ---

  }, [item, isDragging]); 

  const { springScale, springY, springRot } = useSpring({
    springScale: isDragging ? 1.02 : 1,
    springY: isDragging ? 0.2 : 0, 
    springRot: isDragging ? 0.02 : 0, 
    config: { mass: 1, tension: 400, friction: 30 }
  });

  return (
    <animated.group 
      ref={groupRef} 
      position-x={item.position[0]}
      position-z={item.position[2]}
      position-y={springY} 
      rotation={item.rotation} 
      rotation-z={springRot}
      scale={springScale}
      onClick={onClick}
    >
      {children} {/* Context Menu가 여기 들어옴 */}
      
      <group ref={contentRef}>
        <Gltf src={item.modelUrl} castShadow receiveShadow />
      </group>
      
      {/* 회색 선 (Selection Outline) */}
      {isSelected && (
        <mesh position={centerOffset}>
          <boxGeometry args={displaySize} /> 
          <meshBasicMaterial visible={false} />
          <Edges scale={1} threshold={30} color="white" renderOrder={1000} opacity={0.8} />
        </mesh>
      )}
      
      {/* Hit Box */}
      <mesh position={centerOffset} visible={false}>
        <boxGeometry args={displaySize} />
      </mesh>

      {/* Shadow */}
      <animated.mesh position={[0, -springY, 0]} rotation={[-Math.PI/2, 0, 0]} position-y={springY.to(y => -y + 0.005)}>
        <planeGeometry args={[displaySize[0] + 0.1, displaySize[2] + 0.1]} /> 
        <animated.meshBasicMaterial color="#000" opacity={springY.to(y => y * 0.3)} transparent depthWrite={false} />
      </animated.mesh>
    </animated.group>
  );
}