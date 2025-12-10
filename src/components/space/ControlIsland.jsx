import React, { useState, useEffect } from 'react';
import { Box, Sparkles, LayoutTemplate, Ruler, Plus, Trash2, Columns, Lightbulb } from 'lucide-react';
import { useStore } from '../../store/useStore';

// [Sub] Dimension Input
const DimensionInput = ({ value, onChange, label }) => {
  const [tempValue, setTempValue] = useState(value);
  useEffect(() => { setTempValue(value); }, [value]);
  
  const handleBlur = () => {
    let num = parseFloat(tempValue);
    if (isNaN(num)) num = value;
    onChange(num); 
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { handleBlur(); e.target.blur(); }
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-bold text-gray-500">{label}</span>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md px-2 py-0.5 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
          <input type="text" value={tempValue} onChange={(e) => setTempValue(e.target.value)} onBlur={handleBlur} onKeyDown={handleKeyDown} className="w-12 text-right text-xs font-mono font-bold text-blue-600 bg-transparent outline-none" />
          <span className="text-[9px] text-gray-400 font-bold">cm</span>
        </div>
      </div>
      <input 
        type="range" 
        min={label.includes("HEIGHT") ? 1.5 : 2} 
        max={label.includes("HEIGHT") ? 5 : 20} 
        step={0.1}
        value={value / 100} 
        onChange={(e) => onChange(parseFloat(e.target.value) * 100)} 
        className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-black hover:bg-gray-400 transition-colors"
      />
    </div>
  );
};

// [Sub] Wall Selector
const WallSelector = ({ activeWalls, setActiveWalls }) => {
  const toggleWall = (side) => { setActiveWalls(prev => ({ ...prev, [side]: !prev[side] })); };
  const getButtonStyle = (isActive, side) => {
    const base = "absolute transition-all duration-300 cursor-pointer border hover:bg-blue-50";
    const activeClass = isActive ? "bg-black border-black hover:bg-gray-800" : "bg-white border-gray-200 text-gray-300";
    const positions = {
      back:  "top-0 left-1/2 -translate-x-1/2 w-16 h-3 rounded-t-sm", front: "bottom-0 left-1/2 -translate-x-1/2 w-16 h-3 rounded-b-sm",
      left:  "left-0 top-1/2 -translate-y-1/2 w-3 h-16 rounded-l-sm", right: "right-0 top-1/2 -translate-y-1/2 w-3 h-16 rounded-r-sm"
    };
    return `${base} ${activeClass} ${positions[side]}`;
  };
  return (
    <div className="flex flex-col items-center mb-6">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Wall Position</span>
      <div className="relative w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shadow-inner">
        <span className="text-[9px] font-bold text-gray-300 tracking-widest pointer-events-none">FLOOR</span>
        <div onClick={() => toggleWall('back')} className={getButtonStyle(activeWalls.back, 'back')} />
        <div onClick={() => toggleWall('front')} className={getButtonStyle(activeWalls.front, 'front')} />
        <div onClick={() => toggleWall('left')} className={getButtonStyle(activeWalls.left, 'left')} />
        <div onClick={() => toggleWall('right')} className={getButtonStyle(activeWalls.right, 'right')} />
      </div>
    </div>
  );
};

export default function ControlIsland({ 
  activeTab, setActiveTab, 
  roomSize, setRoomSize, 
  activeWalls, setActiveWalls,
  columns, setColumns,
  onAddItem,
  areLightsOn, setAreLightsOn 
}) {
  const { inventory } = useStore();

  const updateRoomSize = (axis, meters) => {
    const maxVal = axis === 'height' ? 5 : 20; const minVal = axis === 'height' ? 1.5 : 2;
    const safeVal = Math.min(Math.max(meters, minVal), maxVal);
    setRoomSize(prev => ({ ...prev, [axis]: safeVal }));
  };
  const handleRoomInput = (axis, valInCm) => { const valInMeters = parseFloat(valInCm) / 100; if (!isNaN(valInMeters)) updateRoomSize(axis, valInMeters); };
  
  // [FIX] 기둥 추가 시 position 배열 확실하게 초기화
  const addColumn = () => { 
    setColumns([...columns, { 
      id: Date.now(), 
      width: 0.6, 
      depth: 0.6, 
      x: 0, 
      z: 0, 
      position: [0, 0, 0], 
      rotation: [0, 0, 0], 
      scale: [1, 1, 1], 
      type: 'column' 
    }]); 
  };
  
  const updateColumnCm = (id, key, valInCm) => { const val = parseFloat(valInCm) / 100; if (!isNaN(val)) setColumns(columns.map(c => c.id === id ? { ...c, [key]: val } : c)); };
  const removeColumn = (id) => { setColumns(columns.filter(col => col.id !== id)); };

  return (
    <div className="absolute bottom-28 right-8 z-50 flex flex-col gap-4 items-end">
      
      <div className="bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl border border-white/40 flex flex-col gap-1">
        <button onClick={() => setActiveTab('SPACE')} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${activeTab === 'SPACE' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-black/5 hover:text-black'}`} title="Space Settings"><LayoutTemplate size={20} strokeWidth={2} /></button>
        <div className="h-[1px] bg-black/5 mx-2 my-1" />
        <button onClick={() => setActiveTab('LAYOUT')} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${activeTab === 'LAYOUT' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-black/5 hover:text-black'}`} title="Furniture & Layout"><Box size={20} strokeWidth={2} /></button>
        <button onClick={() => setActiveTab('PROMPT')} className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 ${activeTab === 'PROMPT' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:bg-black/5 hover:text-black'}`} title="AI Director"><Sparkles size={20} strokeWidth={2} /></button>
      </div>

      {activeTab === 'SPACE' && (
        <div className="absolute bottom-0 right-16 w-80 bg-white/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/50 animate-in slide-in-from-right-4 fade-in duration-300 origin-bottom-right max-h-[80vh] overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-6"><h3 className="text-sm font-bold text-black tracking-tight">SPACE SETTINGS</h3><Ruler size={14} className="text-gray-400" /></div>
          <WallSelector activeWalls={activeWalls} setActiveWalls={setActiveWalls} />
          
          <div className="mb-8">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-4">Dimensions</span>
            <DimensionInput label="WIDTH (가로)" value={Math.round(roomSize.width * 100 * 10) / 10} onChange={(cm) => handleRoomInput('width', cm)} />
            <DimensionInput label="DEPTH (세로)" value={Math.round(roomSize.depth * 100 * 10) / 10} onChange={(cm) => handleRoomInput('depth', cm)} />
            <DimensionInput label="HEIGHT (높이)" value={Math.round(roomSize.height * 100 * 10) / 10} onChange={(cm) => handleRoomInput('height', cm)} />
          </div>

          <div className="h-[1px] bg-black/5 w-full my-6" />
          <div>
            <div className="flex justify-between items-center mb-4"><span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Structural Columns</span><button onClick={addColumn} className="flex items-center gap-1 bg-black text-white px-2 py-1 rounded-md text-[10px] font-bold hover:bg-gray-800 transition-colors"><Plus size={10} /> Add</button></div>
            <div className="flex flex-col gap-3">
              {columns.length === 0 && <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg">No columns added</div>}
              {columns.map((col, idx) => (
                <div key={col.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3 relative group">
                  <div className="flex justify-between items-center mb-2"><span className="text-xs font-bold text-black flex items-center gap-2"><Columns size={12} /> Column 0{idx + 1}</span><button onClick={() => removeColumn(col.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={12} /></button></div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <DimensionInput label="W" value={Math.round(col.width * 100)} onChange={(cm) => updateColumnCm(col.id, 'width', cm)} />
                    <DimensionInput label="D" value={Math.round(col.depth * 100)} onChange={(cm) => updateColumnCm(col.id, 'depth', cm)} />
                    {/* [CRITICAL FIX] 안전 장치 추가: col.position이 없을 경우 [0,0,0]으로 처리 */}
                    <DimensionInput label="Pos X" value={Math.round((col.position?.[0] || 0) * 100)} onChange={(cm) => { /* Gizmo handles this */ }} />
                    <DimensionInput label="Pos Z" value={Math.round((col.position?.[2] || 0) * 100)} onChange={(cm) => { /* Gizmo handles this */ }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'LAYOUT' && (
        <div className="absolute bottom-0 right-16 w-80 bg-white/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/50 animate-in slide-in-from-right-4 fade-in duration-300 origin-bottom-right max-h-[80vh] overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-6"><h3 className="text-sm font-bold text-black tracking-tight">INVENTORY</h3><span className="text-[10px] font-mono bg-gray-100 px-2 py-1 rounded-md text-gray-500">{inventory.length} ITEMS</span></div>
          <div className="mb-4 bg-gray-50 p-3 rounded-xl flex items-center justify-between border border-gray-100">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><Lightbulb size={14} className={areLightsOn ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} /><span>Furniture Lights</span></div>
            <button onClick={() => setAreLightsOn(!areLightsOn)} className={`w-10 h-5 rounded-full transition-colors relative ${areLightsOn ? 'bg-black' : 'bg-gray-300'}`}><div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${areLightsOn ? 'left-6' : 'left-1'}`} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {inventory.length > 0 ? inventory.map((item) => (
              <button key={item.id} onClick={() => onAddItem(item)} className="group relative aspect-square bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-black transition-all shadow-sm hover:shadow-md text-left">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover p-2 group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300"><Box size={24} /></div>}
                <div className="absolute bottom-0 left-0 right-0 bg-white/90 p-2 border-t border-gray-100"><p className="text-[10px] font-bold truncate text-black">{item.name}</p><p className="text-[9px] text-gray-500">₩ {item.price?.toLocaleString()}</p></div>
              </button>
            )) : (
              <div className="col-span-2 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 gap-2"><Box size={24} className="opacity-20" /><span className="text-xs font-medium">Inventory is empty</span></div>
            )}
          </div>
          <button onClick={() => onAddItem(null)} className="w-full py-3.5 bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-transform active:scale-95 shadow-lg shadow-black/10"><Box size={14} /> ADD PROP BLOCK</button>
        </div>
      )}

      {activeTab === 'PROMPT' && (
        <div className="absolute bottom-0 right-16 w-80 bg-white/90 backdrop-blur-2xl rounded-3xl p-5 shadow-2xl border border-white/50 animate-in slide-in-from-right-4 fade-in duration-300 origin-bottom-right">
          <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-bold text-black tracking-tight">AI DIRECTOR</h3><span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">PRO MODE</span></div>
          <textarea className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 resize-none leading-relaxed" placeholder="Describe your scene mood..." />
          <button className="w-full mt-3 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-indigo-200 active:scale-95"><Sparkles size={14} fill="currentColor" /> GENERATE VISION</button>
        </div>
      )}
    </div>
  );
}