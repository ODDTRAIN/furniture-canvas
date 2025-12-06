export const styles = {
  // --- Layout & Background ---
  container: { width: "100%", height: "100vh", position: "relative", overflow: "hidden", background: "transparent", fontFamily: "'SF Pro Display', -apple-system, sans-serif" },
  canvasContainer: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 },
  
  // --- Glass Panels ---
  glassPanel: { background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(40px) saturate(150%)", border: "1px solid rgba(255, 255, 255, 0.6)", boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05), 0 1px 0 rgba(255,255,255,0.5) inset", borderRadius: "24px", color: "#000000", transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)" },
  
  // Top Bar
  topBar: { position: "absolute", top: "24px", left: "24px", right: "24px", height: "72px", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 32px", zIndex: 20, pointerEvents: "none" },
  brandingGroup: { pointerEvents: "auto", display: "flex", flexDirection: "column", gap: "2px" },
  brandTitle: { fontSize: "16px", fontWeight: "900", letterSpacing: "0.05em", textTransform: "uppercase", color: "#000" },
  brandSubtitle: { fontSize: "11px", fontWeight: "500", color: "#666", fontFamily: "'Space Mono', monospace" },
  actionGroup: { pointerEvents: "auto", display: "flex", alignItems: "center", gap: "12px" },
  priceTag: { fontFamily: "'Space Mono', monospace", fontSize: "18px", fontWeight: "700", color: "#000", background: "rgba(0,0,0,0.04)", padding: "10px 16px", borderRadius: "12px" },
  
  // HUD
  hudWrapper: { position: "absolute", top: "110px", right: "24px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "16px", zIndex: 10, maxHeight: "calc(100vh - 140px)", pointerEvents: "none" },
  inspectorPanel: { width: "360px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", overflowX: "visible", scrollbarWidth: "none", maxHeight: "calc(100vh - 220px)", pointerEvents: "auto" },
  
  // Header
  panelHeader: { fontSize: "12px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.05em", color: "#000", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #000", paddingBottom: "12px" },
  activeIndicator: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: '700', color: '#000', letterSpacing: '0.05em' },
  statusDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#34c759', boxShadow: '0 0 8px rgba(52, 199, 89, 0.6)' },
  
  // Acc List
  accSection: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' },
  accListHeader: { fontSize: '11px', fontWeight: '800', color: '#86868b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  accListContainer: { display: 'flex', flexDirection: 'column', gap: '4px' },
  accListItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: '600', color: '#1d1d1f', padding: '8px 10px', background: '#f5f5f7', borderRadius: '8px' },
  accListCount: { fontFamily: "'Space Mono', monospace", fontWeight: '700', color: '#0066cc' },

  // Controls
  controlRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" },
  controlLabel: { fontSize: "13px", fontWeight: "700", color: "#000" },
  hudBtn: { background: "#fff", border: "1px solid #e5e5ea", borderRadius: "8px", padding: "6px 10px", fontSize: "12px", fontWeight: "600", color: "#000", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "32px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" },
  hudBtnActive: { background: "#000", color: "#fff", border: "1px solid #000", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
  
  // Stack Card
  stackCard: {
    background: '#f5f5f7', 
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '8px', 
    border: '1px solid rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
  },
  stackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '8px',
    borderBottom: '1px solid rgba(0,0,0,0.06)'
  },
  stackTitle: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#1d1d1f',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  stackPrice: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#0066cc',
    fontFamily: "'Space Mono', monospace",
    background: '#e0f2ff',
    padding: '4px 8px',
    borderRadius: '6px',
    marginLeft: 'auto',
    marginRight: '8px'
  },

  // Row Control (Restored)
  rowControl: {
    width: '100%', 
    height: '48px',
    background: '#fff',
    borderRadius: '10px',
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    border: '1px solid rgba(0,0,0,0.08)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative'
  },
  rowControlHover: {
    border: '1px solid #000', 
    background: '#E5E5EA', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  
  // Row Delete Button
  rowDeleteBtn: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#f2f2f7',
    color: '#ff3b30',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginLeft: '8px',
    transition: 'all 0.2s',
    padding: 0
  },

  // Flex Wrapper
  rowWrapper: {
    display: 'flex',
    alignItems: 'center',
    width: '100%' 
  },

  stackLabel: { fontSize: '12px', fontWeight: '800', color: '#86868b' },
  stackValue: { fontSize: '14px', fontFamily: "'Space Mono', monospace", fontWeight: '700', color: '#000', display: 'flex', alignItems: 'center', gap: '4px' },

  // Edit Grid (Restored)
  editGrid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '8px', 
    background: '#fff', 
    padding: '8px', 
    borderRadius: '10px', 
    border: '1px solid #000', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%'
  },
  editOptionBtn: { 
    border: '1px solid #e5e5ea', 
    background: '#fff', 
    color: '#000', 
    fontSize: '12px', 
    padding: '12px 0', 
    cursor: 'pointer', 
    fontWeight: 600, 
    borderRadius: '8px', 
    transition: 'all 0.1s' 
  },
  editOptionBtnActive: { 
    background: '#000', 
    color: '#fff', 
    border: '1px solid #000' 
  },

  deleteBtn: { width: "24px", height: "24px", borderRadius: "50%", background: "#ff3b30", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 6px rgba(255, 59, 48, 0.3)" },
  
  addRowBtn: {
    width: '100%',
    padding: '10px',
    border: '1px dashed #c7c7cc',
    borderRadius: '10px',
    background: 'transparent',
    color: '#86868b',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s',
    marginTop: '4px'
  },
  
  // [FIX] 버튼 하단 여백(marginBottom: 6px) 추가
  addStackBtn: {
    width: '100%',
    padding: '16px',
    background: '#1d1d1f', 
    color: '#fff',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '800',
    letterSpacing: '0.02em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    border: 'none',
    marginTop: '24px', 
    marginBottom: '6px', // [수정 완료] 하단 스택과 6px 떨어뜨림
    transition: 'transform 0.1s ease'
  },

  addUnitBlockBtn: { width: "340px", padding: "16px", background: "#fff", color: "#0066cc", borderRadius: "20px", border: "2px dashed #0066cc", fontSize: "14px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", cursor: "pointer", boxShadow: "0 10px 30px rgba(0, 102, 204, 0.1)", transition: "all 0.2s ease", pointerEvents: "auto" },
  addUnitFloatingLeftBtn: { position: "absolute", right: "380px", bottom: "40px", width: "60px", height: "60px", borderRadius: "50%", background: "#0066cc", color: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 30px rgba(0, 102, 204, 0.3)", zIndex: 40, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)", pointerEvents: "auto" },
  emptyState: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none" },
  emptyTitle: { fontSize: "32px", fontWeight: "900", color: "rgba(0,0,0,0.8)", letterSpacing: "-0.02em", marginBottom: "24px" },
  addUnitLargeBtn: { pointerEvents: "auto", background: "#000", color: "white", border: "none", padding: "18px 36px", borderRadius: "100px", fontSize: "16px", fontWeight: "700", cursor: "pointer", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)", transition: "transform 0.2s", display: 'flex', alignItems: 'center', gap: '8px' },
  
  bottomNavContainer: { position: "absolute", bottom: "110px", left: "50%", transform: "translateX(-50%)", zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", pointerEvents: "none" },
  bottomDock: { pointerEvents: "auto", display: "flex", alignItems: "center", justifyContent: "center", height: "64px", borderRadius: "20px", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", overflow: "hidden", whiteSpace: "nowrap" },
  dockContent: { display: "flex", alignItems: "center", gap: "8px", minWidth: "max-content" },
  sideButton: { pointerEvents: "auto", width: "64px", height: "64px", borderRadius: "20px", background: "#F2F2F5", border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)", color: "#000", flexShrink: 0 },
  cartButton: { pointerEvents: "auto", width: "64px", height: "64px", borderRadius: "20px", background: "#1d1d1f", color: "#fff", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)", flexShrink: 0 },
  toolIconBtn: { minWidth: "48px", height: "48px", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px", padding: "0 12px", cursor: "pointer", flexShrink: 0, transition: "all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", position: 'relative' },
  toolIconActive: { background: "#1d1d1f", color: "#fff", border: "1px solid #1d1d1f", transform: "scale(1.05)", boxShadow: "0 10px 20px rgba(0,0,0,0.2)" },
  toolLabel: { fontSize: "11px", fontWeight: "800", textTransform: "uppercase", lineHeight: "1", marginTop: "0px", whiteSpace: "nowrap" },
  viewHintRing: { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: '20px', border: '2px dashed #1d1d1f', opacity: 0.6, pointerEvents: 'none', animation: 'spin 4s linear infinite' },
  dimPill: { background: "#000", padding: "6px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", fontFamily: "'Space Mono', monospace", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.3)", whiteSpace: "nowrap", letterSpacing: "0.05em" },
  furnitureTag: { pointerEvents: "none", background: "#fff", padding: "6px 12px", borderRadius: "999px", fontSize: "11px", fontWeight: "800", color: "#000", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.05em" },
};