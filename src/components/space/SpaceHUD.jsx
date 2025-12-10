import React from 'react';
import { Maximize } from 'lucide-react';

export default function SpaceHUD({ roomSize }) {
  return (
    <div className="absolute top-28 left-8 z-40 bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 flex items-center gap-4 text-white/80 pointer-events-none">
      <div className="flex items-center gap-2">
        <Maximize size={12} className="opacity-50" />
        <span className="text-[10px] font-bold tracking-widest uppercase">Space Dimensions</span>
      </div>
      <div className="w-[1px] h-3 bg-white/20" />
      <div className="flex gap-4 font-mono text-xs font-bold">
        <span>W <span className="text-white">{Math.round(roomSize.width * 100)}</span></span>
        <span>D <span className="text-white">{Math.round(roomSize.depth * 100)}</span></span>
        <span>H <span className="text-white">{Math.round(roomSize.height * 100)}</span></span>
      </div>
    </div>
  );
}