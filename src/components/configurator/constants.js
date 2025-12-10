import * as THREE from "three";
import { MousePointer2, Plus, Edit2, Box } from 'lucide-react';

// ------------------------------------------------------------------
// [SECTION 1] 치수 및 기본 설정
// ------------------------------------------------------------------
export const DEPTH = 0.285;
export const WOOD_THICK = 0.015;
export const SIDE_THICK = 0.0012;
export const DICE_SIZE = 0.025;
export const PIPE_RADIUS = 0.006;
export const INNER_WIDTH = 0.37;

export const UNIT_GAP = 0.15; 
export const LEG_HEIGHT = 0.04;
export const FILLET = 0.001;
export const COLUMN_PITCH = DICE_SIZE / 2 + WOOD_THICK + INNER_WIDTH + WOOD_THICK + DICE_SIZE / 2;

export const getUnitWidth = (cols) => DICE_SIZE + cols * COLUMN_PITCH;

// [DATA] 높이 옵션
export const HEIGHT_OPTIONS = [
  { label: "184mm", val: 0.184 },
  { label: "384mm", val: 0.384 },
  { label: "534mm", val: 0.534 },
  { label: "634mm", val: 0.634 },
];

// ------------------------------------------------------------------
// [SECTION 2] 가격 및 도구 설정
// ------------------------------------------------------------------
export const PRICE_TABLE = {
  0.184: { 1: 280000, 2: 600000, 3: 800000, 4: 1000000 },
  0.384: { 1: 322850, 2: 700700, 3: 943800, 4: 1182500 },
  0.534: { 1: 352000, 2: 744700, 3: 1006500, 4: 1259500 },
  0.634: { 1: 391600, 2: 803000, 3: 1094500, 4: 1360700 },
};

export const ACCESSORY_PRICES = {
  "door-double": 150000,
  "door-flip": 150000,
  speaker: 150000,
  shelf: 150000,
  eraser: 0,
};

export const TOOLS = [
  { id: "door-double", label: "Double Door" },
  { id: "door-flip", label: "Flip Door" },
  { id: "speaker", label: "Speaker" },
  { id: "shelf", label: "Shelf" },
  { id: "eraser", label: "Delete" },
];

const VALID_HEIGHTS = {
  "door-double": [0.534, 0.634],
  "door-flip": [0.384],
  speaker: [0.384, 0.534],
  shelf: [0.384, 0.534, 0.634],
  eraser: [],
};

// ------------------------------------------------------------------
// [SECTION 3] 계산 및 검증 로직
// ------------------------------------------------------------------
export const isHeightValid = (toolId, height) => {
  if (!toolId) return false;
  if (toolId === "eraser") return true;
  const allowed = VALID_HEIGHTS[toolId];
  if (!allowed) return true;
  return allowed.some((h) => Math.abs(h - height) < 0.001);
};

export const calculateUnitPrice = (unit) => {
  let price = 0;
  unit.blocks.forEach((b) => {
    if (!b.rows) return;
    b.rows.forEach((h) => {
      if (h === null || h === undefined) return;
      const hKey = h.toString();
      const rowPriceMap = PRICE_TABLE[hKey];
      if (rowPriceMap) {
        price += rowPriceMap[unit.columns] || 0;
      }
    });
  });
  if (unit.accessories) {
    Object.values(unit.accessories).forEach((data) => {
      const type = data.type;
      const count = data.count || 1;
      const itemPrice = ACCESSORY_PRICES[type] || 0;
      price += itemPrice * count;
    });
  }
  return price;
};

export const getBlockPrice = (block, columns, accessories) => {
  let price = 0;
  if (!block || !block.rows) return 0; 

  block.rows.forEach(h => {
    if (h === null || h === undefined) return; 
    const hKey = h.toString();
    if (PRICE_TABLE[hKey]) {
      price += PRICE_TABLE[hKey][columns] || 0;
    }
  });

  if (accessories) {
    Object.keys(accessories).forEach(key => {
      if (key.includes(block.id)) {
        const item = accessories[key];
        const itemPrice = ACCESSORY_PRICES[item.type] || 0;
        price += itemPrice * (item.count || 1);
      }
    });
  }
  return price;
};

// ------------------------------------------------------------------
// [SECTION 4] 컬렉션 데이터 (The Archive)
// ------------------------------------------------------------------
export const COLLECTION_DATA = {
  templates: [
    { 
      id: 't1', 
      name: 'Studio Starter', 
      price: 850000, 
      desc: 'Compact 4-column unit with multi-layered storage.', 
      image: '/images/t1.png',
      // [FIX] 실제 설계도 데이터 추가
      config: {
        columns: 4, // 가로 4칸
        blocks: [
          // Base Unit (2 Layers)
          { 
            rows: [0.634, 0.534] // Layer 1 (Bottom), Layer 2 (Top)
          },
          // Stack Module 01
          { 
            rows: [0.384] // 384mm
          },
          // Stack Module 02
          { 
            rows: [0.534] // 534mm
          }
        ]
      }
    },
    { 
      id: 't2', 
      name: 'Vinyl Station', 
      price: 1250000, 
      desc: 'Optimized height for LP records with display shelf.', 
      image: '/images/t2.png' 
    },
    { 
      id: 't3', 
      name: 'Library Grand', 
      price: 2400000, 
      desc: 'Full-wall 4-column configuration for collectors.', 
      image: '/images/t3.png' 
    },
    { 
      id: 't4', 
      name: 'Kitchen Island', 
      price: 980000, 
      desc: 'Low profile unit with stainless steel top vibe.', 
      image: '/images/t4.png' 
    },
  ],
  lookbook: [
    "https://images.unsplash.com/photo-1595515106967-1eb6727104f4?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1505693416388-b3ace337fab9?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=800"
  ],
  guide: [
    { title: "Select Unit", desc: "Click any unit to activate inspector.", icon: MousePointer2 },
    { title: "Add Blocks", desc: "Stack modules vertically or add new columns.", icon: Plus },
    { title: "Customize", desc: "Change heights, add doors, or accessories.", icon: Edit2 },
    { title: "Inventory", desc: "Save your design to assets for the showroom.", icon: Box },
  ]
};