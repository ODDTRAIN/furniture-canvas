import { useState, useCallback } from 'react';
import { isHeightValid } from '../components/configurator/constants'; 

export const useConfigurator = () => {
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [editingId, setEditingId] = useState(null); 

  // ------------------------------------------------------------------
  // [CORE] 유닛 추가
  // ------------------------------------------------------------------
  const addUnit = useCallback((templateConfig = null) => {
    const newId = `u-${Date.now()}`;
    
    setUnits((prev) => {
      // [FIX] 안전장치 추가: templateConfig가 있고, 그 안에 'blocks' 배열이 진짜로 있을 때만 템플릿 모드로 동작
      // (버튼 클릭 이벤트 객체가 넘어오는 경우를 걸러냄)
      const isRealTemplate = templateConfig && templateConfig.blocks && Array.isArray(templateConfig.blocks);

      if (isRealTemplate) {
        // (A) 템플릿 모드 (설계도 복제)
        const newUnit = {
          id: newId,
          columns: templateConfig.columns,
          blocks: templateConfig.blocks.map((b, i) => ({
            id: `b-${Date.now()}-${i}`,
            rows: [...b.rows]
          })),
          accessories: templateConfig.accessories ? JSON.parse(JSON.stringify(templateConfig.accessories)) : {}
        };
        return [...prev, newUnit];
      } else {
        // (B) 기본 모드 (빈 유닛 생성)
        const defaultUnit = {
          id: newId,
          columns: 1,
          blocks: [{ id: `b-${Date.now()}`, rows: [0.384] }],
          accessories: {}
        };
        return [...prev, defaultUnit];
      }
    });
    setSelectedUnitId(newId);
  }, []);

  // ------------------------------------------------------------------
  // [CORE] 유닛/블록 관리 (나머지 로직은 기존과 동일)
  // ------------------------------------------------------------------
  const removeUnit = useCallback((id) => {
    setUnits(prev => prev.filter(u => u.id !== id));
    setSelectedUnitId(null);
  }, []);

  const updateColumns = useCallback((id, delta) => {
    setUnits(prev => prev.map(u => 
      u.id === id ? { ...u, columns: Math.max(1, Math.min(4, u.columns + delta)) } : u
    ));
  }, []);

  const addBlockOnTop = useCallback((unitId, height = 0.384) => {
    setUnits(prev => prev.map(u => 
      u.id === unitId ? { ...u, blocks: [...u.blocks, { id: `b-${Date.now()}`, rows: [height] }] } : u
    ));
  }, []);

  const removeBlock = useCallback((unitId, blockIdx) => {
    setUnits(prev => prev.map(u => {
      if (u.id !== unitId) return u;
      const newBlocks = u.blocks.filter((_, idx) => idx !== blockIdx);
      if (newBlocks.length === 0) return { ...u, blocks: [{ id: `b-${Date.now()}`, rows: [0.384] }] };
      return { ...u, blocks: newBlocks };
    }));
  }, []);

  const addRowToBlock = useCallback((unitId, blockId) => {
    setUnits(prev => prev.map(u => u.id === unitId ? {
      ...u,
      blocks: u.blocks.map(b => b.id === blockId ? { ...b, rows: [...b.rows, 0.184] } : b)
    } : u));
  }, []);

  const removeRowFromBlock = useCallback((unitId, blockId, rowIdx) => {
    setUnits(prev => prev.map(u => {
      if (u.id !== unitId) return u;
      const newAcc = Object.fromEntries(Object.entries(u.accessories).filter(([key]) => !key.startsWith(`${blockId}-${rowIdx}-`)));
      return {
        ...u,
        accessories: newAcc,
        blocks: u.blocks.map(b => b.id === blockId ? { ...b, rows: b.rows.filter((_, idx) => idx !== rowIdx) } : b)
      };
    }));
  }, []);

  const updateRowHeight = useCallback((unitId, blockId, rowIdx, newHeight) => {
    setUnits(prev => prev.map(u => u.id === unitId ? {
      ...u,
      blocks: u.blocks.map(b => b.id === blockId ? {
        ...b,
        rows: b.rows.map((r, i) => i === rowIdx ? newHeight : r)
      } : b)
    } : u));
    setEditingId(null);
  }, []);

  // ------------------------------------------------------------------
  // [CORE] 액세서리 관리
  // ------------------------------------------------------------------
  const updateAccessory = useCallback((unitId, cellKey, toolType, rowHeight) => {
    if (!toolType) return;

    if (toolType !== 'eraser' && !isHeightValid(toolType, rowHeight)) {
      alert("This accessory doesn't fit in this height.");
      return;
    }

    setUnits(prev => prev.map(u => {
      if (u.id !== unitId) return u;

      if (toolType === "eraser") {
        const newAcc = { ...u.accessories };
        delete newAcc[cellKey];
        return { ...u, accessories: newAcc };
      }

      const currentAcc = u.accessories[cellKey];
      let newCount = 1;
      
      if (toolType === 'shelf' && currentAcc?.type === 'shelf') {
        newCount = Math.min((currentAcc.count || 1) + 1, 4);
      }

      return {
        ...u,
        accessories: {
          ...u.accessories,
          [cellKey]: { type: toolType, count: newCount }
        }
      };
    }));
  }, []);

  const actions = {
    addUnit,
    removeUnit,
    updateColumns,
    addBlockOnTop,
    removeBlock,
    addRowToBlock,
    removeRowFromBlock,
    updateRowHeight,
    updateAccessory
  };

  return {
    units,
    setUnits, 
    selectedUnitId,
    setSelectedUnitId,
    editingId,
    setEditingId,
    actions
  };
};