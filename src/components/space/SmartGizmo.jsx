import React, { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { getItemDimensions } from '../../pages/Space'; 

export default function SmartGizmo({ 
  selectedItemId, placedItems, setPlacedItems, mode, 
  onTransformStart, onTransformEnd, roomSize, isResizing 
}) {
  const { raycaster, gl } = useThree();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPoint, setDragStartPoint] = useState(new THREE.Vector3());
  const [initialItemState, setInitialItemState] = useState(null);
  
  const [landingPos, setLandingPos] = useState(null); 
  const [alignmentLines, setAlignmentLines] = useState([]); 
  const [snapLevel, setSnapLevel] = useState(0); 
  const [isColliding, setIsColliding] = useState(false);

  const selectedItem = placedItems.find(item => item.uid === selectedItemId);
  const position = selectedItem ? new THREE.Vector3(...selectedItem.position) : new THREE.Vector3();
  const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  const getHitBoxSize = () => {
    if (selectedItem?.width && selectedItem?.depth) {
        const h = selectedItem.height || 1; 
        return { w: selectedItem.width, h, d: selectedItem.depth };
    }
    const dims = getItemDimensions(selectedItem);
    return { w: dims.w, h: dims.h, d: dims.d };
  };
  const hitSize = selectedItem ? getHitBoxSize() : { w: 1, h: 1, d: 1 };
  const gizmoRadius = Math.max(hitSize.w, hitSize.d) / 2 + 0.3;

  // --- Logic ---
  const getBox = (item, posOverride = null) => {
    const pos = posOverride || item.position;
    let width, depth;
    if (item.width && item.depth) { width = item.width; depth = item.depth; } 
    else { const dims = getItemDimensions(item); width = dims.w; depth = dims.d; }

    const rot = item.rotation ? item.rotation[1] : 0;
    const absRot = Math.abs(rot % Math.PI);
    const isRot90 = absRot > Math.PI / 4 && absRot < 3 * Math.PI / 4;
    const finalW = isRot90 ? depth : width;
    const finalD = isRot90 ? width : depth;

    // Margin을 약간 주어 너무 빡빡하지 않게 함
    const margin = 0.005;
    return {
      minX: pos[0] - finalW / 2 + margin, maxX: pos[0] + finalW / 2 - margin,
      minZ: pos[2] - finalD / 2 + margin, maxZ: pos[2] + finalD / 2 - margin,
      width: finalW, depth: finalD,
      centerX: pos[0], centerZ: pos[2]
    };
  };

  const checkCollisionSimple = (targetItem, pos, allItems) => {
    const targetBox = getBox(targetItem, pos);
    const EPSILON = 0.001;
    for (let other of allItems) {
      if (other.uid === targetItem.uid) continue; 
      const otherBox = getBox(other);
      if (targetBox.maxX > otherBox.minX + EPSILON && targetBox.minX < otherBox.maxX - EPSILON &&
          targetBox.maxZ > otherBox.minZ + EPSILON && targetBox.minZ < otherBox.maxZ - EPSILON) {
        return true;
      }
    }
    return false;
  };

  const calculateAlignment = (targetX, targetZ) => {
    const SNAP_DIST = 0.2; 
    const myBox = getBox(selectedItem, [targetX, 0, targetZ]);
    let bestX = targetX, bestZ = targetZ;
    let minDiffX = SNAP_DIST, minDiffZ = SNAP_DIST;
    const newLines = [];
    
    for (let other of placedItems) {
      if (other.uid === selectedItem.uid) continue;
      const otherBox = getBox(other);
      const xTargets = [otherBox.minX, otherBox.maxX, otherBox.centerX];
      const myXPoints = [{ offset: myBox.width/2 }, { offset: -myBox.width/2 }, { offset: 0 }];
      for (let target of xTargets) {
        for (let point of myXPoints) {
          const aligned = target + point.offset;
          if (Math.abs(aligned - targetX) < minDiffX) {
            minDiffX = Math.abs(aligned - targetX);
            bestX = aligned;
            newLines.push({ axis: 'x', pos: target, start: -50, end: 50 });
          }
        }
      }
      const zTargets = [otherBox.minZ, otherBox.maxZ, otherBox.centerZ];
      const myZPoints = [{ offset: myBox.depth/2 }, { offset: -myBox.depth/2 }, { offset: 0 }];
      for (let target of zTargets) {
        for (let point of myZPoints) {
          const aligned = target + point.offset;
          if (Math.abs(aligned - targetZ) < minDiffZ) {
            minDiffZ = Math.abs(aligned - targetZ);
            bestZ = aligned;
            newLines.push({ axis: 'z', pos: target, start: -50, end: 50 });
          }
        }
      }
    }
    const visualLines = newLines.map(l => {
      if (l.axis === 'x') return [[l.pos, 0.05, l.start], [l.pos, 0.05, l.end]];
      return [[l.start, 0.05, l.pos], [l.end, 0.05, l.pos]];
    });
    if (minDiffX === SNAP_DIST && minDiffZ === SNAP_DIST) return { x: targetX, z: targetZ, lines: [], snapped: false };
    return { x: minDiffX < SNAP_DIST ? bestX : targetX, z: minDiffZ < SNAP_DIST ? bestZ : targetZ, lines: visualLines, snapped: true };
  };

  const handlePointerDown = (e) => {
    if (!selectedItem || isResizing) return;
    e.stopPropagation();
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(floorPlane, intersectPoint);
    if (intersectPoint) {
      setIsDragging(true);
      const offset = new THREE.Vector3().subVectors(
        new THREE.Vector3(selectedItem.position[0], 0, selectedItem.position[2]), intersectPoint
      );
      setDragStartPoint(offset);
      setInitialItemState({ ...selectedItem });
      onTransformStart?.(); 
      gl.domElement.style.cursor = 'grabbing';
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      setLandingPos(null); 
      setAlignmentLines([]);
      setSnapLevel(0);
      setIsColliding(false);
      onTransformEnd?.(); 
      gl.domElement.style.cursor = 'auto';
    }
  };

  const handleGlobalMove = (e) => {
    if (!isDragging || !selectedItem || isResizing) return;
    e.stopPropagation();
    const currentPoint = e.point; 
    currentPoint.y = 0; 

    setPlacedItems(prev => prev.map(item => {
      if (item.uid !== selectedItemId) return item;

      if (mode === 'translate') {
        let rawX = currentPoint.x + dragStartPoint.x;
        let rawZ = currentPoint.z + dragStartPoint.z;
        const { x: alignedX, z: alignedZ, lines, snapped } = calculateAlignment(rawX, rawZ);
        setAlignmentLines(lines);
        setSnapLevel(snapped ? 1 : 0);
        
        const halfW = roomSize.width/2 - hitSize.w/2;
        const halfD = roomSize.depth/2 - hitSize.d/2;
        let targetX = Math.max(-halfW, Math.min(halfW, alignedX));
        let targetZ = Math.max(-halfD, Math.min(halfD, alignedZ));

        // [BLOCK COLLISION]
        // 이동하려는 위치에 다른 가구가 있으면 이동을 아예 막습니다. (Return original item)
        const isHit = checkCollisionSimple(item, [targetX, 0, targetZ], placedItems);
        setIsColliding(isHit);
        
        // 충돌 시 빨간 박스만 보여주고 실제 이동은 하지 않음
        if (isHit) {
            setLandingPos([targetX, 0, targetZ]);
            return item; 
        }

        setLandingPos([targetX, 0, targetZ]);
        return { ...item, position: [targetX, item.position[1] || 0, targetZ] };

      } else if (mode === 'rotate') {
        const center = new THREE.Vector3(initialItemState.position[0], 0, initialItemState.position[2]);
        const angle = Math.atan2(e.point.z - center.z, e.point.x - center.x);
        
        const targetRotation = -angle; 
        const SNAP_FINE = Math.PI / 12; 
        const SNAP_MAJOR = Math.PI / 2; 
        
        const snappedRotationY = Math.round(targetRotation / SNAP_FINE) * SNAP_FINE; 
        
        const isMajorSnap = Math.abs(snappedRotationY % SNAP_MAJOR) < 0.001;
        setSnapLevel(isMajorSnap ? 2 : 1);

        const isHit = checkCollisionSimple(item, [item.position[0], 0, item.position[2]], placedItems);
        setIsColliding(isHit);
        setLandingPos(item.position);

        return { ...item, rotation: [0, snappedRotationY, 0] };
      }
      return item;
    }));
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  if (!selectedItem) return null;

  const footprintColor = isColliding ? "#FF3B30" : (snapLevel > 0 ? "#FF3B30" : "#007AFF");
  const ringColor = isColliding ? "#FF3B30" : (snapLevel === 2 ? "#FFFFFF" : (snapLevel === 1 ? "#FF3B30" : "#888888"));
  const ringOpacity = snapLevel === 2 ? 1.0 : (snapLevel === 1 ? 0.8 : 0.3);
  const ringThickness = snapLevel === 2 ? 0.03 : 0.015;

  const cx = selectedItem.centerOffset ? selectedItem.centerOffset[0] : 0;
  const cz = selectedItem.centerOffset ? selectedItem.centerOffset[2] : 0;

  return (
    <group>
      {isDragging && !isResizing && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onPointerMove={handleGlobalMove} visible={false}>
          <planeGeometry args={[100, 100]} /> 
        </mesh>
      )}

      <group position={position}>
        <mesh rotation={[0, selectedItem.rotation[1], 0]} position={[0, hitSize.h / 2, 0]} onPointerDown={handlePointerDown} onPointerOver={() => !isDragging && !isResizing && (gl.domElement.style.cursor = 'grab')} onPointerOut={() => !isDragging && (gl.domElement.style.cursor = 'auto')} visible={false}>
          <boxGeometry args={[hitSize.w, hitSize.h, hitSize.d]} /> 
        </mesh>

        {isDragging && landingPos && (
          <group position={[landingPos[0] - position.x, 0 - position.y, landingPos[2] - position.z]} rotation={[0, selectedItem.rotation[1], 0]}>
            <group position={[cx, 0, cz]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <planeGeometry args={[hitSize.w, hitSize.d]} />
                <meshBasicMaterial color={footprintColor} opacity={0.2} transparent depthWrite={false} />
                </mesh>
                <lineSegments rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 0]}>
                <edgesGeometry args={[new THREE.PlaneGeometry(hitSize.w, hitSize.d)]} />
                <lineBasicMaterial color={footprintColor} opacity={0.8} transparent linewidth={1} />
                </lineSegments>
            </group>
          </group>
        )}

        {isDragging && alignmentLines.map((points, idx) => (
          <group key={idx} position={[-position.x, 0, -position.z]}>
             <Line points={points} color="#FF3B30" opacity={0.8} transparent lineWidth={2} depthTest={false} position={[0, 0.05, 0]} />
          </group>
        ))}

        {isDragging && mode === 'rotate' && (
          <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
              <ringGeometry args={[gizmoRadius, gizmoRadius + ringThickness, 64]} /> 
              <meshBasicMaterial color={ringColor} opacity={ringOpacity} transparent side={2} toneMapped={false} />
            </mesh>
            {Array.from({ length: 24 }).map((_, i) => {
              const isMajor = i % 6 === 0;
              const tickLength = isMajor ? 0.15 : 0.08;
              const tickWidth = isMajor ? 0.01 : 0.005;
              const tickOpacity = isMajor ? 0.6 : 0.3;
              return (
                <group key={i} rotation={[0, (Math.PI / 12) * i, 0]}>
                   <mesh position={[gizmoRadius + 0.05, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]}>
                      <planeGeometry args={[tickLength, tickWidth]} />
                      <meshBasicMaterial color="#333333" opacity={tickOpacity} transparent />
                   </mesh>
                </group>
              );
            })}
            <Html position={[0, hitSize.h + 0.3, 0]} center pointerEvents="none" zIndexRange={[100, 0]}>
              <div className={`backdrop-blur-md text-[10px] font-mono px-3 py-1.5 rounded-full border transition-all duration-150 ${
                isColliding ? "bg-red-500 text-white border-red-400" : (snapLevel === 2 ? "bg-white text-black border-white shadow-lg scale-110" : "bg-[#FF3B30] text-white border-red-400")
              }`}>
                <span className="font-bold mr-1">ROT</span>
                {(-(selectedItem.rotation[1] * 180 / Math.PI) % 360).toFixed(0)}°
              </div>
            </Html>
          </group>
        )}

        {isDragging && mode === 'translate' && (
          <Html position={[0, hitSize.h + 0.3, 0]} center pointerEvents="none" zIndexRange={[100, 0]}>
            <div className={`backdrop-blur-md text-[9px] font-sans font-medium px-2.5 py-1 rounded-full border shadow-sm ${isColliding ? "bg-red-500/80 text-white border-red-400/50" : "bg-black/60 text-white border-white/10"}`}>
              <span>{Math.round(position.x * 100)}, {Math.round(position.z * 100)}</span>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}