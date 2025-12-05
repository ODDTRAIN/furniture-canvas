import React from "react";

export const ToggleSwitch = ({ label, value, onChange }) => (
  <div style={styles.toggleRow}>
    <span style={styles.toggleLabel}>{label}</span>
    <div style={{...styles.toggleTrack, background: value ? "#34c759" : "#e9e9ea"}} onClick={() => onChange(!value)}>
      <div style={{...styles.toggleKnob, transform: value ? "translateX(22px)" : "translateX(2px)"}} />
      <span style={{ ...styles.toggleText, left: "6px", opacity: value ? 1 : 0 }}>ON</span>
      <span style={{ ...styles.toggleText, right: "6px", opacity: value ? 0 : 1 }}>OFF</span>
    </div>
  </div>
);

export const styles = {
  container: { width: "100%", height: "100vh", position: "fixed", top: 0, left: 0, overflow: "hidden", background: "#f5f5f7", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" },
  canvasContainer: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0 },
  
  // Right System Panel
  uiPanel: { position: "absolute", top: "24px", right: "24px", width: "300px", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(20px)", borderRadius: "24px", border: "1px solid rgba(255, 255, 255, 0.5)", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", zIndex: 10, display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: "calc(100vh - 48px)" },
  
  // Summary (Left of System Panel)
  summaryPanel: { position: "absolute", top: "24px", right: "340px", width: "200px", background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(20px)", borderRadius: "20px", border: "1px solid rgba(255, 255, 255, 0.5)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", zIndex: 10, padding: "16px", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" },
  
  // Toolbar
  toolbarContainer: { position: "absolute", bottom: "140px", left: "50%", transform: "translateX(-50%)", zIndex: 50, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" },
  toolbarWrapper: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
  toolGroupAnimation: { animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)", transformOrigin: "bottom center" },
  toolbarGlass: { background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(20px) saturate(180%)", padding: "12px 20px", borderRadius: "24px", boxShadow: "0 10px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.4)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", minWidth: "300px" },
  mainToggleBtn: { width: "56px", height: "56px", borderRadius: "50%", border: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", fontSize: "28px", fontWeight: "300", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)" },
  toggleHint: { fontSize: "12px", fontWeight: "600", color: "#86868b", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)", padding: "4px 12px", borderRadius: "99px", marginTop: "-4px", pointerEvents: "none" },
  toolGroup: { display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" },
  toolbarLabel: { fontSize: "11px", fontWeight: "700", color: "#86868b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" },
  toolBtn: { padding: "8px 16px", borderRadius: "12px", fontSize: "13px", fontWeight: "500", color: "#1d1d1f", background: "rgba(0,0,0,0.03)", border: "1px solid transparent", cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap" },
  doneBtn: { marginTop: "4px", border: "none", background: "#0071e3", color: "#fff", padding: "8px 24px", borderRadius: "99px", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(0, 113, 227, 0.3)" },

  // Header & Controls
  header: { padding: "24px", borderBottom: "1px solid rgba(0,0,0,0.04)" },
  titleGroup: { display: "flex", flexDirection: "column" },
  title: { fontSize: "20px", fontWeight: "600", color: "#1d1d1f", letterSpacing: "-0.01em", margin: 0 },
  price: { fontSize: "16px", fontWeight: "500", color: "#86868b", marginTop: "4px" },
  toggleGroup: { display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" },
  toggleContainer: { display: "flex", alignItems: "center", gap: "10px" },
  toggleLabelText: { fontSize: "12px", fontWeight: "600", color: "#86868b" },
  toggleRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  toggleLabel: { fontSize: "13px", fontWeight: "600", color: "#1d1d1f" },
  toggleTrack: { position: "relative", width: "52px", height: "28px", borderRadius: "99px", cursor: "pointer", transition: "background 0.3s ease", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px", boxSizing: "border-box" },
  toggleKnob: { position: "absolute", top: "2px", left: "2px", width: "24px", height: "24px", background: "#fff", borderRadius: "50%", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transition: "transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)", zIndex: 2 },
  toggleText: { fontSize: "9px", fontWeight: "800", color: "#fff", position: "absolute", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", transition: "opacity 0.2s" },
  exportBtn: { marginTop: "16px", padding: "12px", fontSize: "13px", fontWeight: "600", color: "#0071e3", background: "rgba(0, 113, 227, 0.1)", borderRadius: "12px", border: "none", cursor: "pointer", transition: "all 0.2s", width: "100%" },
  resetBtn: { background: "none", border: "none", fontSize: "16px", cursor: "pointer", color: "#86868b", padding: "0 4px", marginLeft: "10px" },
  priceRow: { display: "flex", alignItems: "center", gap: "8px" },

  // List & Cards
  emptyState: { flexGrow: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px", textAlign: "center" },
  emptyIcon: { width: "56px", height: "56px", background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", color: "#d1d1d6", marginBottom: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  emptyTitle: { fontSize: "20px", fontWeight: "700", color: "#1d1d1f", marginBottom: "10px" },
  scrollArea: { padding: "20px", overflowY: "auto", flexGrow: 1, display: "flex", flexDirection: "column", gap: "16px" },
  card: { background: "white", borderRadius: "12px", padding: "12px", marginBottom: "10px", border: "1px solid #eee" },
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
  
  // Summary
  summaryHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
  summaryTitle: { fontSize: "12px", fontWeight: "700", color: "#1d1d1f", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" },
  summaryToggle: { fontSize: "10px", color: "#86868b" },
  summaryContent: { marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(0,0,0,0.05)" },
  summaryRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", fontSize: "12px", color: "#424245", fontWeight: "500" },
  summaryLabel: {},
  summaryValue: { fontWeight: "700", color: "#1d1d1f", background: "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: "6px", minWidth: "20px", textAlign: "center" },
  
  // Modal
  modalOverlay: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 },
  modalContent: { background: "white", padding: "30px", borderRadius: "24px", width: "320px", position: "relative" },
  closeBtn: { position: "absolute", top: "20px", right: "20px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#999" },
  input: { width: "100%", padding: "12px", marginBottom: "10px", border: "1px solid #eee", borderRadius: "10px", boxSizing: "border-box" },
  cancelBtn: { flex: 1, padding: "12px", background: "#f5f5f7", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  saveBtn: { flex: 1, padding: "12px", background: "#34c759", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "13px", fontWeight: "600" },
  miniBtn: { padding: "4px 8px", fontSize: "10px", background: "#1d1d1f", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" },
};