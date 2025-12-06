// ... (기존 치수 상수들 유지)
export const DEPTH = 0.285;
export const WOOD_THICK = 0.015;
export const SIDE_THICK = 0.0012;
export const DICE_SIZE = 0.025;
export const PIPE_RADIUS = 0.006;
export const INNER_WIDTH = 0.37;

// [수정 포인트] UNIT_GAP: 0.05(5cm) -> 0.15(15cm)
// 치수선과 텍스트가 서로 겹치지 않도록 충분한 간격을 확보합니다.
export const UNIT_GAP = 0.15; 
export const LEG_HEIGHT = 0.04;

export const FILLET = 0.001;

export const COLUMN_PITCH = DICE_SIZE / 2 + WOOD_THICK + INNER_WIDTH + WOOD_THICK + DICE_SIZE / 2;

export const getUnitWidth = (cols) => DICE_SIZE + cols * COLUMN_PITCH;

export const HEIGHT_OPTIONS = [
  { label: "184mm", val: 0.184 },
  { label: "384mm", val: 0.384 },
  { label: "534mm", val: 0.534 },
  { label: "634mm", val: 0.634 },
];

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
  { id: "door-double", label: "양문형 도어" },
  { id: "door-flip", label: "플립 도어" },
  { id: "speaker", label: "스피커" },
  { id: "shelf", label: "추가 선반" },
  { id: "eraser", label: "삭제" },
];

const VALID_HEIGHTS = {
  "door-double": [0.534, 0.634],
  "door-flip": [0.384],
  speaker: [0.384, 0.534],
  shelf: [0.384, 0.534, 0.634],
  eraser: [],
};

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
    b.rows.forEach((h) => {
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