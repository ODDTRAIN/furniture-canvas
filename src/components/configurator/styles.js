export const styles = {
  // ... (상단 UI 유지: container ~ addUnitFloatingLeftBtn) ...
  container: { width: "100%", height: "100vh", position: "relative", overflow: "hidden", background: "transparent", fontFamily: "'SF Pro Display', -apple-system, sans-serif" },
  canvasContainer: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 },
  glassPanel: { background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(40px) saturate(150%)", border: "1px solid rgba(255, 255, 255, 0.6)", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05), 0 1px 0 rgba(255,255,255,0.5) inset", borderRadius: "24px", color: "#000000", transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)" },
  topBar: { position: "absolute", top: "24px", left: "24px", right: "24px", height: "72px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 32px", zIndex: 20, pointerEvents: "none" },
  brandingGroup: { pointerEvents: "auto", display: "flex", flexDirection: "column", gap: "2px" },
  brandTitle: { fontSize: "16px", fontWeight: "900", letterSpacing: "0.05em", textTransform: "uppercase", color: "#000" },
  brandSubtitle: { fontSize: "11px", fontWeight: "500", color: "#666", fontFamily: "'Space Mono', monospace" },
  actionGroup: { pointerEvents: "auto", display: "flex", alignItems: "center", gap: "12px" },
  priceTag: { fontFamily: "'Space Mono', monospace", fontSize: "18px", fontWeight: "700", color: "#000", background: "rgba(0,0,0,0.04)", padding: "10px 16px", borderRadius: "12px" },
  hudWrapper: { position: "absolute", top: "110px", right: "24px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "16px", zIndex: 10, maxHeight: "calc(100vh - 140px)", pointerEvents: "none" },
  inspectorPanel: { width: "340px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", overflowX: "visible", scrollbarWidth: "none", maxHeight: "calc(100vh - 220px)", pointerEvents: "auto" },
  accSection: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' },
  accListHeader: { fontSize: '11px', fontWeight: '800', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  accListContainer: { display: 'flex', flexDirection: 'column', gap: '4px' },
  accListItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', padding: '8px 10px', background: '#f5f5f7', borderRadius: '8px' },
  accListCount: { fontFamily: "'Space Mono', monospace", fontWeight: '700', color: '#0066cc' },
  panelHeader: { fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#000", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #000", paddingBottom: "12px" },
  controlRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  controlLabel: { fontSize: "13px", fontWeight: "700", color: "#000" },
  hudBtn: { background: "#fff", border: "1px solid #e5e5ea", borderRadius: "8px", padding: "6px 10px", fontSize: "12px", fontWeight: "600", color: "#000", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "32px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" },
  hudBtnActive: { background: "#000", color: "#fff", borderColor: "#000", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
  stackContainer: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px', background: '#f5f5f7', borderRadius: '16px', marginTop: '8px' },
  stackBlock: { width: '100%', background: '#fff', border: '1px solid #d1d1d6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)', position: 'relative', overflow: 'hidden' },
  stackLabel: { fontSize: '12px', fontWeight: '800', color: '#86868b', zIndex: 1 },
  stackValue: { fontSize: '15px', fontFamily: "'Space Mono', monospace", fontWeight: '700', color: '#000', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' },
  editGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid #000', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' },
  editOptionBtn: { border: '1px solid #e5e5ea', background: '#fff', color: '#000', fontSize: '13px', padding: '10px 0', cursor: 'pointer', fontWeight: 600, borderRadius: '6px', transition: 'all 0.1s' },
  editOptionBtnActive: { background: '#000', color: '#fff', borderColor: '#000' },
  deleteBtn: { width: "24px", height: "24px", borderRadius: "50%", background: "#ff3b30", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 6px rgba(255, 59, 48, 0.3)" },
  addUnitBlockBtn: { width: "340px", padding: "16px", background: "#fff", color: "#0066cc", borderRadius: "20px", border: "2px dashed #0066cc", fontSize: "14px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", boxShadow: "0 10px 30px rgba(0, 102, 204, 0.1)", transition: "all 0.2s ease", pointerEvents: "auto" },
  addUnitFloatingLeftBtn: { position: "absolute", right: "380px", bottom: "40px", width: "60px", height: "60px", borderRadius: "50%", background: "#0066cc", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0, 102, 204, 0.3)", zIndex: 40, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", pointerEvents: "auto" },
  
  // --- Bottom Navigation Container ---
  bottomNavContainer: {
    position: "absolute",
    bottom: "110px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px", // 버튼 사이 간격
    pointerEvents: "none",
  },

  // --- Center Dock ---
  bottomDock: { 
    pointerEvents: "auto",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    height: "64px",
    borderRadius: "20px", 
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    overflow: "hidden", 
    whiteSpace: "nowrap" 
    // [중요] transition 제거 (JS 제어)
  },
  
  // --- [NEW] Inner Content Wrapper ---
  dockContent: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    minWidth: "max-content", // 찌그러짐 방지
  },
  
  // --- Side Buttons (Gray Cards) ---
  sideButton: { 
    pointerEvents: "auto",
    width: "64px", 
    height: "64px",
    borderRadius: "20px", 
    background: "#F2F2F5", 
    border: "1px solid rgba(0,0,0,0.05)",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    cursor: "pointer", 
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)", 
    color: "#000",
    flexShrink: 0 // 찌그러짐 방지
    // [중요] transition 제거
  },

  cartButton: { 
    pointerEvents: "auto",
    width: "64px", 
    height: "64px",
    borderRadius: "20px", 
    background: "#1d1d1f", 
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    cursor: "pointer", 
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)", 
    flexShrink: 0
    // [중요] transition 제거
  },

  // --- Tool Icons ---
  toolIconBtn: { 
    minWidth: "48px", 
    height: "48px", 
    borderRadius: "14px", 
    border: "1px solid rgba(0,0,0,0.08)", 
    background: "rgba(255,255,255,0.5)", 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    justifyContent: "center", 
    gap: "2px", 
    padding: "0 12px", 
    cursor: "pointer", 
    flexShrink: 0, 
    transition: "all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)", 
    boxShadow: "0 2px 8px rgba(0,0,0,0.02)", 
    position: 'relative' 
  },
  
  toolIconActive: { background: "#1d1d1f", color: "#fff", border: "1px solid #1d1d1f", transform: "scale(1.05)", boxShadow: "0 10px 20px rgba(0,0,0,0.2)" },
  toolLabel: { fontSize: "11px", fontWeight: "800", textTransform: "uppercase", lineHeight: "1", marginTop: "0px", whiteSpace: "nowrap" },
  
  // Rotating Ring
  viewHintRing: { 
    position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, 
    borderRadius: '20px', 
    border: '2px dashed #1d1d1f', 
    opacity: 0.6, 
    pointerEvents: 'none',
    animation: 'spin 4s linear infinite' 
  },
  
  emptyState: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" },
  emptyTitle: { fontSize: "32px", fontWeight: "900", color: "rgba(0,0,0,0.8)", letterSpacing: "-0.02em", marginBottom: "24px" },
  addUnitLargeBtn: { pointerEvents: "auto", background: "#000", color: "white", border: "none", padding: "18px 36px", borderRadius: "100px", fontSize: "16px", fontWeight: "700", cursor: "pointer", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)", transition: "transform 0.2s", display: 'flex', alignItems: 'center', gap: '8px' },
  activeIndicator: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '700', color: '#000', letterSpacing: '0.05em' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#34c759', boxShadow: '0 0 8px rgba(52, 199, 89, 0.6)' },
  dimPill: { background: "#000", padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", fontFamily: "'Space Mono', monospace", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", whiteSpace: "nowrap", letterSpacing: "0.05em" },
  furnitureTag: { pointerEvents: "none", background: "#fff", padding: "6px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: "800", color: "#000", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.05em" },
};