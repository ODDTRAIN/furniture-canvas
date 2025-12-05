export const styles = {
  // 1. 전체 컨테이너: 화면 꽉 채우기
  container: {
    width: "100%",
    height: "100vh", 
    position: "relative",
    overflow: "hidden",
    background: "#f5f5f7", // 애플 기본 배경색
  },

  // 2. 3D 캔버스: 배경으로 깔리기
  canvasContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0, // 맨 뒤로 보냄
  },

  // 3. UI 패널 (오른쪽)
  uiPanel: {
    position: "absolute",
    top: "24px",
    right: "24px", 
    width: "320px", 
    background: "rgba(255, 255, 255, 0.7)", 
    backdropFilter: "blur(20px)", // 유리 효과
    borderRadius: "24px", 
    border: "1px solid rgba(255, 255, 255, 0.5)", 
    boxShadow: "0 20px 40px rgba(0,0,0,0.05)", 
    zIndex: 10, 
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    maxHeight: "calc(100vh - 48px)", 
  },

  // 4. 왼쪽 요약 패널
  summaryPanel: {
    position: "absolute",
    top: "24px",
    left: "24px",
    width: "240px",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    zIndex: 10,
    padding: "16px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
  },

 // 5. 하단 툴바
  toolbarContainer: {
    position: "absolute",
    bottom: "100px", // Dock 위로 띄움
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 20,
  },
  
  toolbar: {
    background: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(25px) saturate(180%)", 
    padding: "8px 12px",
    borderRadius: "999px", 
    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid rgba(255,255,255,0.4)",
  },

  // --- 기존 스타일 유지 ---
  header: { padding: "24px", borderBottom: "1px solid rgba(0,0,0,0.04)" },
  titleGroup: { display: "flex", flexDirection: "column" },
  title: { fontSize: "20px", fontWeight: "600", color: "#1d1d1f", letterSpacing: "-0.01em", margin: 0 },
  price: { fontSize: "16px", fontWeight: "500", color: "#86868b", marginTop: "4px" },
  
  toggleGroup: { display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" },
  toggleContainer: { display: "flex", alignItems: "center", gap: "10px" },
  toggleLabelText: { fontSize: "12px", fontWeight: "600", color: "#86868b" },
  
  emptyState: { flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", textAlign: "center" },
  emptyIcon: { width: "56px", height: "56px", background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", color: "#d1d1d6", marginBottom: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  emptyTitle: { fontSize: "20px", fontWeight: "700", color: "#1d1d1f", marginBottom: "10px" },
  
  scrollArea: { padding: "20px", overflowY: "auto", flexGrow: 1, display: "flex", flexDirection: "column", gap: "16px" },
  cardOdd: { background: "rgba(255,255,255,0.5)", borderRadius: "16px", padding: "16px", marginBottom: "10px" },
  cardEven: { background: "rgba(245,245,247,0.5)", borderRadius: "16px", padding: "16px", marginBottom: "10px" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
  unitBadge: { fontSize: "11px", fontWeight: "700", color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em" },
  textBtn: { background: "none", border: "none", color: "#ff3b30", cursor: "pointer", fontSize: "12px", fontWeight: "600", padding: "4px 8px" },
  
  controlRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", columnGap: "16px" },
  label: { fontSize: "13px", fontWeight: "700", color: "#1d1d1f" },
  stepper: { display: "flex", alignItems: "center", background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "3px" },
  stepBtn: { width: "32px", height: "32px", border: "none", background: "#fff", borderRadius: "6px", boxShadow: "0 1px 2px rgba(0,0,0,0.06)", cursor: "pointer", fontWeight: "600", color: "#1d1d1f", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" },
  stepVal: { padding: "0 12px", fontSize: "13px", fontWeight: "600", fontFeatureSettings: "'tnum'", minWidth: "32px", textAlign: "center" },
  
  blocksList: { display: "flex", flexDirection: "column", gap: "12px" },
  blockItem: { background: "#fff", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "8px", padding: "16px" },
  blockHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", fontWeight: "800", color: "#1d1d1f", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.02em" },
  iconBtn: { border: "none", background: "none", color: "#aeaeb2", cursor: "pointer", fontSize: "16px", padding: "2px", lineHeight: 1 },
  
  layerContainer: { marginBottom: "8px", minHeight: "32px" },
  rowDisplay: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", color: "#1d1d1f", paddingLeft: "10px", borderLeft: "3px solid var(--color-accent)", height: "32px" },
  layerLabel: { fontWeight: "600", color: "#333" },
  valuePill: { display: "flex", alignItems: "center", gap: "4px", background: "#fff", border: "1px solid #e5e5ea", borderRadius: "5px", padding: "4px 8px", fontSize: "12px", fontWeight: "600", color: "#1d1d1f", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" },
  chevron: { fontSize: "8px", color: "#86868b", opacity: 0.7 },
  
  editGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "4px", marginBottom: "4px" },
  editBtn: { padding: "6px 0", fontSize: "11px", border: "1px solid #d2d2d7", borderRadius: "6px", background: "#fff", cursor: "pointer", fontWeight: "600", color: "#1d1d1f" },
  rowRemoveBtn: { background: "none", border: "none", color: "#c7c7cc", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "16px", marginLeft: "4px" },
  
  addRowSection: { marginTop: "12px" },
  layerAddLabel: { fontSize: "11px", color: "#8e8e93", marginBottom: "6px" },
  optGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "6px" },
  optBtn: { padding: "8px", fontSize: "12px", background: "#fff", border: "1px solid #d1d1d6", borderRadius: "8px", cursor: "pointer", color: "#1d1d1f", fontWeight: "500" },
  addSection: { marginTop: "16px", paddingTop: "12px", borderTop: "1px dashed #d1d1d6" },
  
  primaryBtn: { padding: "10px", fontSize: "12px", background: "#1d1d1f", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" },
  mainBtn: { padding: "16px", background: "var(--color-accent)", color: "#fff", border: "none", borderRadius: "14px", fontSize: "15px", fontWeight: "600", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,102,204,0.2)", width: "100%", letterSpacing: "-0.01em" },
  exportBtn: { marginTop: "16px", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#0071e3", background: "rgba(0, 113, 227, 0.1)", borderRadius: "12px", border: "none", cursor: "pointer", transition: "all 0.2s", width: "100%" },

  // Tool Buttons
  toolGroup: { display: "flex", gap: "8px" },
  toolbarLabel: { fontSize: "11px", fontWeight: "600", color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em" },
  toolBtn: { padding: "10px 18px", borderRadius: "99px", fontSize: "13px", fontWeight: "500", color: "#1d1d1f", background: "transparent", border: "none", cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap" },
  doneBtn: { marginTop: "4px", border: "none", background: "#0066cc", color: "#fff", padding: "6px 20px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },

  // Summary
  summaryHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
  summaryTitle: { fontSize: "12px", fontWeight: "700", color: "#1d1d1f", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" },
  summaryToggle: { fontSize: "10px", color: "#86868b" },
  summaryContent: { marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.05)" },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontSize: "12px", color: "#424245", fontWeight: "500" },
  summaryLabel: {},
  summaryValue: { fontWeight: "700", color: "#1d1d1f", background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: "6px", minWidth: "20px", textAlign: "center" },

  // Elements
  dimPill: { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", padding: "6px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", color: "#1d1d1f", boxShadow: "0 4px 12px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)", whiteSpace: "nowrap", letterSpacing: "0.02em" },
  furnitureTag: { pointerEvents: "none", background: "#1d1d1f", color: "#fff", padding: "4px 10px", borderRadius: "999px", fontSize: "10px", fontWeight: "600", boxShadow: "0 3px 6px rgba(0,0,0,0.25)", whiteSpace: "nowrap" },
};