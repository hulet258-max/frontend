import React, { useState, useEffect } from "react";
import { defaultTheme, defaultTexts, lookPresets } from "../themeConfig";

// Helper to convert hex to RGB
const hexToRgb = (hex) => {
  if (!hex) return "139, 90, 43";
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
  }
  return "139, 90, 43";
};

const Looks = () => {
  const [imageFile, setImageFile] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState("");
  const [theme, setTheme] = useState(defaultTheme);
  const [texts, setTexts] = useState(defaultTexts);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeGroup, setActiveGroup] = useState("hero");

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    // Load existing look configuration so the form reflects current values
    fetch(`${process.env.REACT_APP_API_URL}/api/look`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;

        if (data.theme) {
          setTheme((prev) => ({ ...prev, ...data.theme }));
        }
        if (data.texts) {
          setTexts((prev) => ({ ...prev, ...data.texts }));
        }
        if (data.imageUrl) {
          setExistingImageUrl(data.imageUrl);
        }
      })
      .catch((err) => {
        console.error("Error loading look configuration:", err);
      });
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      let imageBase64 = null;
      if (imageFile) {
        imageBase64 = await fileToBase64(imageFile);
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/look`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64,
          theme,
          texts,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.message || "Failed to save look");
      }

      setMessage("Look saved successfully.");
    } catch (err) {
      console.error("Error saving look:", err);
      setMessage("Error saving look. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleApply = () => {
    handleSave();
  };

  const handleApplyPreset = async (presetId) => {
    const preset = lookPresets[presetId];
    if (!preset) return;

    const nextTheme = {
      ...theme,
      ...preset.theme,
    };

    try {
      setSaving(true);
      setMessage("");
      setTheme(nextTheme);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/look`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: nextTheme,
          texts,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.message || "Failed to apply preset");
      }

      setMessage(`${preset.label} look applied.`);
    } catch (err) {
      console.error("Error applying preset:", err);
      setMessage("Error applying look. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      setMessage("");

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/look`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme: defaultTheme,
          texts: defaultTexts,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || data.message || "Failed to reset look");
      }

      setTheme(defaultTheme);
      setTexts(defaultTexts);
      setMessage("Look reset to standard defaults.");
    } catch (err) {
      console.error("Error resetting look:", err);
      setMessage("Error resetting look. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="look-settings-page" style={styles.wrapper}>
      <h1 style={styles.heading}>Look Settings</h1>
      <p style={styles.subtext}>
        Configure the logo, cafe or hotel name, and preview changes in real time.
      </p>

      <div className="look-settings-layout" style={styles.layout}>
        {/* Left: grouped controls */}
        <div
          className="glass-panel look-settings-panel"
          style={{
            ...styles.leftPane,
            backgroundColor: "rgba(255, 255, 255, 0.35)",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <div className="look-group-nav" style={styles.groupNav}>
            {[
              { id: "hero", label: "Logo & Name" },
              { id: "texts", label: "Texts" },
              { id: "colors", label: "Colors" },
              { id: "special", label: "Special Look" },
              { id: "typography", label: "Typography" },
            ].map((g) => {
              const isActive = activeGroup === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setActiveGroup(g.id)}
                  style={{
                    ...styles.groupNavButton,
                    ...(isActive
                      ? {
                          backgroundColor: theme.primary,
                          borderColor: theme.primary,
                          color: "white",
                          boxShadow: `0 4px 12px rgba(${hexToRgb(theme.primary)}, 0.2)`,
                        }
                      : {
                          backgroundColor: "rgba(255, 255, 255, 0.45)",
                          borderColor: "rgba(139, 90, 43, 0.15)",
                          color: theme.textMain,
                        }),
                  }}
                >
                  {g.label}
                </button>
              );
            })}
          </div>

          <div style={styles.formGrid}>
            {activeGroup === "hero" && (
              <>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Logo Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="glass-input"
                    style={{ padding: "8px" }}
                  />
                  {imageFile && (
                    <span style={styles.helper}>Selected: {imageFile.name}</span>
                  )}
                  {!imageFile && existingImageUrl && (
                    <span style={styles.helper}>Current image in use.</span>
                  )}
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Cafe or Hotel Name</label>
                  <input
                    type="text"
                    value={texts.heroTitle}
                    onChange={(e) =>
                      setTexts((prev) => ({ ...prev, heroTitle: e.target.value }))
                    }
                    placeholder="e.g. Blue Door Cafe"
                    className="glass-input"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Short Description</label>
                  <textarea
                    value={texts.heroSubtitle}
                    onChange={(e) =>
                      setTexts((prev) => ({ ...prev, heroSubtitle: e.target.value }))
                    }
                    placeholder="Short description for this look"
                    rows={3}
                    className="glass-input"
                    style={{ resize: "vertical" }}
                  />
                </div>
              </>
            )}

            {activeGroup === "texts" && (
              <>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Loading Title</label>
                  <input
                    type="text"
                    value={texts.loadingTitle}
                    onChange={(e) =>
                      setTexts((prev) => ({ ...prev, loadingTitle: e.target.value }))
                    }
                    className="glass-input"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Loading Description</label>
                  <input
                    type="text"
                    value={texts.loadingDesc}
                    onChange={(e) =>
                      setTexts((prev) => ({ ...prev, loadingDesc: e.target.value }))
                    }
                    className="glass-input"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Empty Menu Title</label>
                  <input
                    type="text"
                    value={texts.emptyMenuTitle}
                    onChange={(e) =>
                      setTexts((prev) => ({
                        ...prev,
                        emptyMenuTitle: e.target.value,
                      }))
                    }
                    className="glass-input"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Empty Menu Description</label>
                  <input
                    type="text"
                    value={texts.emptyMenuDesc}
                    onChange={(e) =>
                      setTexts((prev) => ({
                        ...prev,
                        emptyMenuDesc: e.target.value,
                      }))
                    }
                    className="glass-input"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Empty Category Description</label>
                  <input
                    type="text"
                    value={texts.emptyCategoryDesc}
                    onChange={(e) =>
                      setTexts((prev) => ({
                        ...prev,
                        emptyCategoryDesc: e.target.value,
                      }))
                    }
                    className="glass-input"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Currency Symbol</label>
                  <input
                    type="text"
                    value={texts.currencySymbol}
                    onChange={(e) =>
                      setTexts((prev) => ({
                        ...prev,
                        currencySymbol: e.target.value,
                      }))
                    }
                    className="glass-input"
                  />
                </div>
              </>
            )}

            {activeGroup === "colors" && (
              <>
                <div style={styles.colorsRow}>
                  <div style={styles.colorField}>
                    <label style={styles.label}>Primary Color</label>
                    <input
                      type="color"
                      value={theme.primary}
                      onChange={(e) =>
                        setTheme((prev) => ({ ...prev, primary: e.target.value }))
                      }
                      style={styles.colorInput}
                    />
                  </div>
                  <div style={styles.colorField}>
                    <label style={styles.label}>Background Color</label>
                    <input
                      type="color"
                      value={theme.bg}
                      onChange={(e) =>
                        setTheme((prev) => ({ ...prev, bg: e.target.value }))
                      }
                      style={styles.colorInput}
                    />
                  </div>
                  <div style={styles.colorField}>
                    <label style={styles.label}>Accent Color</label>
                    <input
                      type="color"
                      value={theme.accent}
                      onChange={(e) =>
                        setTheme((prev) => ({ ...prev, accent: e.target.value }))
                      }
                      style={styles.colorInput}
                    />
                  </div>
                  <div style={styles.colorField}>
                    <label style={styles.label}>Header Color</label>
                    <input
                      type="color"
                      value={theme.surface}
                      onChange={(e) =>
                        setTheme((prev) => ({ ...prev, surface: e.target.value }))
                      }
                      style={styles.colorInput}
                    />
                  </div>
                </div>

                <div style={styles.colorsRow}>
                  <div style={styles.colorField}>
                    <label style={styles.label}>Text Main Color</label>
                    <input
                      type="color"
                      value={theme.textMain}
                      onChange={(e) =>
                        setTheme((prev) => ({ ...prev, textMain: e.target.value }))
                      }
                      style={styles.colorInput}
                    />
                  </div>
                  <div style={styles.colorField}>
                    <label style={styles.label}>Text Muted Color</label>
                    <input
                      type="color"
                      value={theme.textMuted}
                      onChange={(e) =>
                        setTheme((prev) => ({ ...prev, textMuted: e.target.value }))
                      }
                      style={styles.colorInput}
                    />
                  </div>
                  <div style={styles.colorField}>
                    <label style={styles.label}>Border Color</label>
                    <input
                      type="color"
                      value={theme.border}
                      onChange={(e) =>
                        setTheme((prev) => ({ ...prev, border: e.target.value }))
                      }
                      style={styles.colorInput}
                    />
                  </div>
                </div>
              </>
            )}

            {activeGroup === "special" && (
              <>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Seasonal Looks</label>
                  <div className="preset-grid" style={styles.presetGrid}>
                    {Object.entries(lookPresets)
                      .filter(([id]) => id !== "standard")
                      .map(([id, preset]) => {
                        const isActive = theme.lookPreset === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => handleApplyPreset(id)}
                            disabled={saving}
                            className="look-preset-card"
                            style={{
                              ...styles.presetCard,
                              borderColor: isActive
                                ? preset.theme.primary
                                : "rgba(139, 90, 43, 0.16)",
                              backgroundColor: isActive
                                ? preset.theme.surface
                                : "rgba(255, 255, 255, 0.48)",
                            }}
                          >
                            <span
                              style={{
                                ...styles.presetSwatch,
                                background: `linear-gradient(135deg, ${preset.theme.primary}, ${preset.theme.secondary || preset.theme.accent || preset.theme.primary})`,
                              }}
                            />
                            <span style={styles.presetText}>
                              <strong>{preset.label}</strong>
                              <span>{isActive ? "Active look" : "Apply look"}</span>
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Base Look</label>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset("standard")}
                    disabled={saving}
                    className="glass-btn"
                    style={{
                      justifyContent: "flex-start",
                      borderColor:
                        theme.lookPreset === "standard"
                          ? theme.primary
                          : "rgba(139, 90, 43, 0.15)",
                    }}
                  >
                    Use Standard Cafe Look
                  </button>
                </div>
              </>
            )}

            {activeGroup === "typography" && (
              <>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Heading Font (CSS)</label>
                  <input
                    type="text"
                    value={theme.fontHeading}
                    onChange={(e) =>
                      setTheme((prev) => ({
                        ...prev,
                        fontHeading: e.target.value,
                      }))
                    }
                    className="glass-input"
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Body Font (CSS)</label>
                  <input
                    type="text"
                    value={theme.fontBody}
                    onChange={(e) =>
                      setTheme((prev) => ({ ...prev, fontBody: e.target.value }))
                    }
                    className="glass-input"
                  />
                </div>
              </>
            )}
          </div>

          <div style={styles.buttonRow}>
            <button
              type="button"
              onClick={handleSave}
              className="glass-btn look-action-button"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="glass-btn look-action-button"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "#dc2626",
                borderColor: "rgba(239, 68, 68, 0.25)",
              }}
              disabled={saving}
            >
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="glass-btn glass-btn-primary look-action-button"
              style={{
                backgroundColor: theme.primary,
                borderColor: theme.primary,
                color: "#ffffff",
                boxShadow: `0 4px 12px rgba(${hexToRgb(theme.primary)}, 0.2)`,
              }}
            >
              Apply
            </button>
          </div>

          {message && <p style={styles.feedback}>{message}</p>}
        </div>

        {/* Right: live preview */}
        <div className="look-preview-pane" style={styles.rightPane}>
          <div style={{ ...styles.previewBox, backgroundColor: theme.isChristmasMode ? theme.christmasBg : theme.bg }}>
            {/* Ambient preview blobs */}
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                top: 0,
                left: 0,
                zIndex: 0,
                overflow: "hidden",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  borderRadius: "50%",
                  width: "140px",
                  height: "140px",
                  background: `radial-gradient(circle, rgba(${hexToRgb(theme.isChristmasMode ? theme.christmasPrimary : theme.primary)}, 0.4) 0%, transparent 80%)`,
                  top: "-10px",
                  left: "-10px",
                  filter: "blur(20px)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  borderRadius: "50%",
                  width: "180px",
                  height: "180px",
                  background: `radial-gradient(circle, rgba(${hexToRgb(theme.isChristmasMode ? theme.christmasAccent : theme.accent)}, 0.15) 0%, transparent 80%)`,
                  bottom: "-20px",
                  right: "-20px",
                  filter: "blur(20px)",
                }}
              />
            </div>

            {/* Floating glassy preview header */}
            <div
              className="glass-panel"
              style={{
                margin: "12px",
                padding: "16px 12px",
                textAlign: "center",
                fontFamily: theme.fontHeading,
                backgroundColor: "rgba(255, 255, 255, 0.45)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                position: "relative",
                zIndex: 1,
                borderRadius: "14px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 4px",
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: theme.isChristmasMode ? theme.christmasPrimary : theme.primary,
                }}
              >
                {theme.isChristmasMode && <span style={{ marginRight: 6 }}>🎄</span>}
                {texts.heroTitle}
                {theme.isChristmasMode && <span style={{ marginLeft: 6 }}>🎄</span>}
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.85rem",
                  color: theme.textMuted,
                  fontStyle: "italic",
                }}
              >
                {texts.heroSubtitle}
              </p>
            </div>

            <div style={{ padding: "0 12px 12px", position: "relative", zIndex: 1 }}>
              <div style={{ marginBottom: "10px", fontSize: "0.75rem", fontWeight: 600, color: theme.textMuted }}>
                Live menu preview
              </div>

              <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                <span style={styles.previewCategoryChip(theme, true)}>Coffee</span>
                <span style={styles.previewCategoryChip(theme, false)}>Bakery</span>
              </div>

              <div style={styles.previewProductCard(theme)}>
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255, 255, 255, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "10px",
                    flexShrink: 0,
                    fontSize: "1.2rem",
                  }}
                >
                  ☕
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      color: theme.textMain,
                      fontSize: "0.9rem",
                      marginBottom: "2px",
                    }}
                  >
                    Flat White
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: theme.textMuted,
                      marginBottom: "4px",
                    }}
                  >
                    Velvety espresso with steamed milk.
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      color: theme.isChristmasMode ? theme.christmasPrimary : theme.primary,
                      fontSize: "0.9rem",
                    }}
                  >
                    {texts.currencySymbol}4.50
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Looks;

const styles = {
  wrapper: {
    maxWidth: "1080px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  heading: {
    fontSize: "1.6rem",
    fontWeight: 700,
    margin: 0,
  },
  subtext: {
    margin: 0,
    color: "#6b7280",
    fontSize: "0.95rem",
  },
  formGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginTop: "12px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#4b5563",
  },
  helper: {
    fontSize: "0.8rem",
    color: "#6b7280",
  },
  layout: {
    display: "flex",
    flexDirection: "row",
    gap: "24px",
    alignItems: "flex-start",
  },
  leftPane: {
    flex: 1.25,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  rightPane: {
    flex: 1,
    position: "sticky",
    top: "20px",
  },
  groupNav: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "4px",
  },
  groupNavButton: {
    padding: "6px 14px",
    borderRadius: "999px",
    border: "1px solid",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    transition: "all 0.2s ease",
  },
  colorsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "16px",
  },
  colorField: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  colorInput: {
    width: "60px",
    height: "36px",
    padding: 0,
    border: "1px solid rgba(139, 90, 43, 0.15)",
    borderRadius: "8px",
    backgroundColor: "transparent",
    cursor: "pointer",
  },
  presetGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
  },
  presetCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },
  presetSwatch: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    flexShrink: 0,
    border: "1px solid rgba(255, 255, 255, 0.7)",
  },
  presetText: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
    color: "#1f2937",
    fontSize: "0.85rem",
  },
  buttonRow: {
    marginTop: "16px",
    display: "flex",
    gap: "12px",
    justifyContent: "space-between",
  },
  feedback: {
    marginTop: "8px",
    fontSize: "0.9rem",
    color: "#8B5A2B",
    fontWeight: "600",
    textAlign: "center",
  },
  previewBox: {
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.45)",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(139, 90, 43, 0.05)",
    minHeight: "300px",
    position: "relative",
    transition: "background-color 0.5s ease",
  },
  previewCategoryChip: (theme, active) => ({
    padding: "4px 12px",
    borderRadius: "999px",
    border: active 
      ? `1px solid ${theme.isChristmasMode ? theme.christmasPrimary : theme.primary}`
      : "1px solid rgba(255, 255, 255, 0.4)",
    backgroundColor: active 
      ? (theme.isChristmasMode ? theme.christmasPrimary : theme.primary)
      : "rgba(255, 255, 255, 0.4)",
    color: active ? "#ffffff" : theme.textMain,
    fontSize: "0.75rem",
    fontWeight: "600",
  }),
  previewProductCard: (theme) => ({
    display: "flex",
    alignItems: "center",
    padding: "12px",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.45)",
    backgroundColor: "rgba(255, 255, 255, 0.55)",
    backdropFilter: "blur(6px)",
  }),
};
