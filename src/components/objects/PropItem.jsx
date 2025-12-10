import React, { useState } from 'react';
import { Html, Edges, useCursor } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

function ResizeHandles({ item, onResize, setIsResizing }) {
  const [hovered, setHover] = useState(null);
  useCursor(hovered ? 'pointer' : 'auto');
  const handleSize = 0.08; 
  const halfW = item.width / 2;
  const halfH = item.height; 
  const halfD = item.depth / 2;

  const onPointerDown = (e, axis, dir) => {
    e.stopPropagation(); e.nativeEvent.stopImmediatePropagation();
    if(setIsResizing) setIsResizing(true);
    e.target.setPointerCapture(e.pointerId);
    
    const startPoint = e.point.clone();
    const startSize = { w: item.width, h: item.height, d: item.depth };

    e.target.onpointermove = (ev) => {
      ev.stopPropagation();
      const diff = ev.point.clone().sub(startPoint);
      let newW = startSize.w, newH = startSize.h, newD = startSize.d;
      if (axis === 'x') newW = Math.max(0.1, startSize.w + diff.x * dir);
      if (axis === 'y') newH = Math.max(0.1, startSize.h + diff.y * dir);
      if (axis === 'z') newD = Math.max(0.1, startSize.d + diff.z * dir);
      onResize(item.uid, { width: newW, height: newH, depth: newD });
    };

    e.target.onpointerup = (ev) => {
      ev.target.releasePointerCapture(ev.pointerId);
      if(setIsResizing) setIsResizing(false);
      ev.target.onpointermove = null;
      ev.target.onpointerup = null;
    };
  };

  const Handle = ({ pos, axis, dir }) => (
    <mesh position={pos} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)} onPointerDown={(e) => onPointerDown(e, axis, dir)}>
      <boxGeometry args={[handleSize, handleSize, handleSize]} />
      <meshBasicMaterial color={hovered ? "#32ADE6" : "white"} depthTest={false} />
    </mesh>
  );

  return (
    <group>
      <Handle pos={[halfW, halfH/2, 0]} axis="x" dir={1} />
      <Handle pos={[-halfW, halfH/2, 0]} axis="x" dir={-1} />
      <Handle pos={[0, halfH, 0]} axis="y" dir={1} />
      <Handle pos={[0, halfH/2, halfD]} axis="z" dir={1} />
      <Handle pos={[0, halfH/2, -halfD]} axis="z" dir={-1} />
    </group>
  );
}

export default function PropItem({ item, isSelected, isDragging, onClick, onResize, setIsResizing, children }) {
  const { springScale, springY, springRot } = useSpring({
    springScale: isDragging ? 1.02 : 1,
    springY: isDragging ? 0.2 : 0, 
    springRot: isDragging ? 0.02 : 0, 
    config: { mass: 1, tension: 400, friction: 30 }
  });

  return (
    <animated.group 
      position-x={item.position[0]}
      position-z={item.position[2]}
      position-y={springY.to(y => y + (item.position[1] || 0))} 
      rotation={item.rotation} 
      rotation-z={springRot}
      scale={springScale}
      onClick={onClick}
    >
      {children}
      <group position={[0, item.height/2, 0]}>
        <mesh>
            <boxGeometry args={[item.width, item.height, item.depth]} />
            <meshStandardMaterial color="#FF9500" transparent opacity={0.3} />
        </mesh>
        <Edges color="#FF9500" threshold={15} />
        {item.label && (
            <Html center position={[0, 0, 0]} pointerEvents="none" zIndexRange={[50, 0]}>
                <div className="text-white/80 font-black text-[10px] tracking-widest uppercase drop-shadow-md">{item.label}</div>
            </Html>
        )}
      </group>
      {isSelected && <ResizeHandles item={item} onResize={onResize} setIsResizing={setIsResizing} />}
    </animated.group>
  );
}