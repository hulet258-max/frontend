import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import { defaultTexts, defaultTheme } from "../themeConfig";

const POSTER_WIDTH = 1240;
const POSTER_HEIGHT = 1754;
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

const templateDefinitions = [
  {
    id: "classic",
    name: "Classic Counter",
    tone: "Warm light poster",
  },
  {
    id: "bold",
    name: "Bold Entrance",
    tone: "High contrast sign",
  },
  {
    id: "minimal",
    name: "Minimal Table Card",
    tone: "Clean printable card",
  },
];

const derivePublicMenuUrl = () => {
  if (typeof window === "undefined") return "";

  const url = new URL(window.location.href);
  url.pathname = url.pathname.replace(/\/home\/?$/, "/") || "/";
  url.search = "";
  url.hash = "";
  return url.toString();
};

const buildImageUrl = (url) => {
  if (!url || url.startsWith("data:")) return url;
  const params = "w=800&q=auto&f=auto";
  return url.includes("?") ? `${url}&${params}` : `${url}?${params}`;
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    if (!src) {
      resolve(null);
      return;
    }

    const img = new Image();
    if (!src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const slugify = (value) =>
  (value || "menu")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "menu";

const getInitials = (name) => {
  const words = (name || "Cafe")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
};

const fillRoundedRect = (ctx, x, y, width, height, radius, fillStyle) => {
  ctx.fillStyle = fillStyle;
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.fill();
};

const strokeRoundedRect = (ctx, x, y, width, height, radius, strokeStyle, lineWidth = 2) => {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.stroke();
};

const fitFontSize = (ctx, text, maxWidth, startSize, minSize, family, weight = 800) => {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${weight} ${size}px ${family}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 3;
  }
  return size;
};

const drawCenteredText = ({
  ctx,
  text,
  x,
  y,
  maxWidth,
  size,
  minSize = 36,
  family = "Georgia, serif",
  weight = 800,
  color = "#111827",
}) => {
  const finalSize = fitFontSize(ctx, text, maxWidth, size, minSize, family, weight);
  ctx.font = `${weight} ${finalSize}px ${family}`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x, y);
};

const drawWrappedText = ({
  ctx,
  text,
  x,
  y,
  maxWidth,
  lineHeight,
  maxLines = 2,
  size = 34,
  family = "Inter, Arial, sans-serif",
  weight = 500,
  color = "#374151",
  align = "center",
}) => {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  ctx.font = `${weight} ${size}px ${family}`;

  words.forEach((word) => {
    const testLine = current ? `${current} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = testLine;
    }
  });

  if (current) lines.push(current);

  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  lines.slice(0, maxLines).forEach((line, index) => {
    ctx.fillText(line, x, y + index * lineHeight);
  });
};

const drawLogoMark = ({ ctx, logoImg, brandName, x, y, size, primary, accent, dark = false }) => {
  const center = x + size / 2;
  const middle = y + size / 2;

  ctx.save();
  ctx.shadowColor = dark ? "rgba(0, 0, 0, 0.28)" : "rgba(31, 41, 55, 0.14)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  fillRoundedRect(ctx, x, y, size, size, size / 2, "#ffffff");
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, middle, size / 2 - 10, 0, Math.PI * 2);
  ctx.clip();

  if (logoImg) {
    const scale = Math.max(size / logoImg.width, size / logoImg.height);
    const drawWidth = logoImg.width * scale;
    const drawHeight = logoImg.height * scale;
    ctx.drawImage(
      logoImg,
      center - drawWidth / 2,
      middle - drawHeight / 2,
      drawWidth,
      drawHeight
    );
  } else {
    ctx.fillStyle = primary;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.22;
    ctx.beginPath();
    ctx.arc(x + size * 0.25, y + size * 0.2, size * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${Math.floor(size * 0.34)}px Georgia, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(getInitials(brandName), center, middle + 4);
  }
  ctx.restore();

  ctx.strokeStyle = dark ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.92)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(center, middle, size / 2 - 5, 0, Math.PI * 2);
  ctx.stroke();
};

const createQrCanvas = async (menuUrl, dark = "#111827") => {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, menuUrl, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 470,
    color: {
      dark,
      light: "#ffffff",
    },
  });
  return canvas;
};

const drawQrCard = ({ ctx, qrCanvas, x, y, size, borderColor, shadow = true }) => {
  ctx.save();
  if (shadow) {
    ctx.shadowColor = "rgba(15, 23, 42, 0.18)";
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 18;
  }
  fillRoundedRect(ctx, x, y, size, size, 48, "#ffffff");
  ctx.restore();
  strokeRoundedRect(ctx, x, y, size, size, 48, borderColor, 4);
  ctx.drawImage(qrCanvas, x + 34, y + 34, size - 68, size - 68);
};

const renderTemplate = async ({ templateId, brandName, logoImg, menuUrl, theme, subtitle }) => {
  const canvas = document.createElement("canvas");
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const ctx = canvas.getContext("2d");
  const primary = theme.primary || defaultTheme.primary;
  const secondary = theme.secondary || "#2F5D50";
  const accent = theme.accent || defaultTheme.accent;
  const surface = theme.surface || "#ffffff";
  const brand = brandName || defaultTexts.heroTitle;
  const caption = subtitle || "Scan to view our menu";

  if (templateId === "classic") {
    const qrCanvas = await createQrCanvas(menuUrl, "#1F2937");

    ctx.fillStyle = theme.bg || "#F7F4EF";
    ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
    ctx.fillStyle = primary;
    ctx.fillRect(0, 0, POSTER_WIDTH, 475);
    ctx.fillStyle = accent;
    ctx.fillRect(0, 444, POSTER_WIDTH, 31);

    drawLogoMark({
      ctx,
      logoImg,
      brandName: brand,
      x: POSTER_WIDTH / 2 - 95,
      y: 104,
      size: 190,
      primary,
      accent,
      dark: true,
    });

    drawCenteredText({
      ctx,
      text: brand,
      x: POSTER_WIDTH / 2,
      y: 370,
      maxWidth: 920,
      size: 74,
      minSize: 42,
      color: "#ffffff",
    });

    drawCenteredText({
      ctx,
      text: "Digital Menu",
      x: POSTER_WIDTH / 2,
      y: 594,
      maxWidth: 780,
      size: 60,
      minSize: 40,
      family: "Inter, Arial, sans-serif",
      weight: 800,
      color: "#1F2937",
    });
    drawWrappedText({
      ctx,
      text: caption,
      x: POSTER_WIDTH / 2,
      y: 658,
      maxWidth: 780,
      lineHeight: 42,
      color: "#6B7280",
      size: 32,
    });

    drawQrCard({
      ctx,
      qrCanvas,
      x: POSTER_WIDTH / 2 - 290,
      y: 770,
      size: 580,
      borderColor: "rgba(111, 78, 55, 0.16)",
    });

    drawCenteredText({
      ctx,
      text: "Scan with your camera",
      x: POSTER_WIDTH / 2,
      y: 1456,
      maxWidth: 780,
      size: 46,
      minSize: 34,
      family: "Inter, Arial, sans-serif",
      weight: 800,
      color: primary,
    });
    drawWrappedText({
      ctx,
      text: menuUrl,
      x: POSTER_WIDTH / 2,
      y: 1532,
      maxWidth: 980,
      lineHeight: 32,
      maxLines: 2,
      size: 24,
      color: "#6B7280",
    });
  }

  if (templateId === "bold") {
    const qrCanvas = await createQrCanvas(menuUrl, "#0F172A");

    ctx.fillStyle = "#17120F";
    ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
    ctx.fillStyle = secondary;
    ctx.fillRect(0, 0, 188, POSTER_HEIGHT);
    ctx.fillStyle = primary;
    ctx.fillRect(188, 0, 22, POSTER_HEIGHT);
    ctx.fillStyle = accent;
    ctx.fillRect(210, 0, 12, POSTER_HEIGHT);

    ctx.globalAlpha = 0.1;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    for (let i = -POSTER_HEIGHT; i < POSTER_WIDTH; i += 120) {
      ctx.beginPath();
      ctx.moveTo(i, POSTER_HEIGHT);
      ctx.lineTo(i + POSTER_HEIGHT, 0);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    drawLogoMark({
      ctx,
      logoImg,
      brandName: brand,
      x: 370,
      y: 140,
      size: 180,
      primary,
      accent,
      dark: true,
    });

    ctx.fillStyle = accent;
    ctx.font = "800 34px Inter, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("SCAN FOR MENU", 370, 420);

    const titleSize = fitFontSize(
      ctx,
      brand,
      690,
      84,
      46,
      "Georgia, serif",
      800
    );
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${titleSize}px Georgia, serif`;
    ctx.textAlign = "left";
    ctx.fillText(brand, 370, 520);

    drawWrappedText({
      ctx,
      text: caption,
      x: 370,
      y: 594,
      maxWidth: 690,
      lineHeight: 40,
      maxLines: 2,
      size: 31,
      color: "rgba(255,255,255,0.76)",
      align: "left",
    });

    drawQrCard({
      ctx,
      qrCanvas,
      x: 370,
      y: 748,
      size: 560,
      borderColor: "rgba(217, 164, 65, 0.8)",
      shadow: false,
    });

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 44px Inter, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Open camera. Scan. Order.", 370, 1418);

    drawWrappedText({
      ctx,
      text: menuUrl,
      x: 370,
      y: 1492,
      maxWidth: 690,
      lineHeight: 34,
      maxLines: 2,
      size: 24,
      color: "rgba(255,255,255,0.7)",
      align: "left",
    });
  }

  if (templateId === "minimal") {
    const qrCanvas = await createQrCanvas(menuUrl, "#1F2937");

    ctx.fillStyle = surface;
    ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
    ctx.fillStyle = theme.bg || "#F7F4EF";
    ctx.fillRect(64, 64, POSTER_WIDTH - 128, POSTER_HEIGHT - 128);
    ctx.fillStyle = primary;
    ctx.fillRect(64, 64, 26, POSTER_HEIGHT - 128);
    ctx.fillStyle = accent;
    ctx.fillRect(90, 64, 12, POSTER_HEIGHT - 128);

    strokeRoundedRect(ctx, 124, 124, POSTER_WIDTH - 248, POSTER_HEIGHT - 248, 46, "rgba(31, 41, 55, 0.12)", 3);

    drawLogoMark({
      ctx,
      logoImg,
      brandName: brand,
      x: POSTER_WIDTH / 2 - 82,
      y: 186,
      size: 164,
      primary,
      accent,
    });

    drawCenteredText({
      ctx,
      text: brand,
      x: POSTER_WIDTH / 2,
      y: 448,
      maxWidth: 830,
      size: 68,
      minSize: 38,
      color: "#111827",
    });

    ctx.fillStyle = primary;
    ctx.font = "800 42px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Menu", POSTER_WIDTH / 2, 548);

    drawQrCard({
      ctx,
      qrCanvas,
      x: POSTER_WIDTH / 2 - 275,
      y: 672,
      size: 550,
      borderColor: "rgba(31, 41, 55, 0.12)",
      shadow: false,
    });

    fillRoundedRect(ctx, POSTER_WIDTH / 2 - 300, 1316, 600, 92, 46, primary);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 34px Inter, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scan for our latest menu", POSTER_WIDTH / 2, 1374);

    drawWrappedText({
      ctx,
      text: menuUrl,
      x: POSTER_WIDTH / 2,
      y: 1508,
      maxWidth: 820,
      lineHeight: 32,
      maxLines: 2,
      size: 24,
      color: "#6B7280",
    });
  }

  return canvas.toDataURL("image/png", 1);
};

const QrGenerator = () => {
  const [brandName, setBrandName] = useState(defaultTexts.heroTitle);
  const [subtitle, setSubtitle] = useState(defaultTexts.heroSubtitle);
  const [logoImageUrl, setLogoImageUrl] = useState("");
  const [theme, setTheme] = useState(defaultTheme);
  const [options, setOptions] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const menuUrl = useMemo(() => derivePublicMenuUrl(), []);
  const selectedOption = options.find((option) => option.id === selectedTemplate);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/look`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        const nextTexts = data.texts || {};
        setBrandName(nextTexts.heroTitle || data.title || defaultTexts.heroTitle);
        setSubtitle(nextTexts.heroSubtitle || data.description || defaultTexts.heroSubtitle);
        setLogoImageUrl(data.imageUrl || "");
        if (data.theme) {
          setTheme((prev) => ({ ...prev, ...data.theme }));
        }
      })
      .catch((err) => {
        console.error("Error loading QR look settings:", err);
        setMessage("Using default logo details because look settings could not load.");
      });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const generateOptions = async () => {
      setGenerating(true);
      setMessage("");

      try {
        let logoImg = null;
        if (logoImageUrl) {
          try {
            logoImg = await loadImage(buildImageUrl(logoImageUrl));
          } catch (err) {
            console.warn("Logo could not be loaded for QR poster generation:", err);
          }
        }

        const renderAllTemplates = async (imageForLogo) => {
          const renderedTemplates = [];
          for (const template of templateDefinitions) {
            const dataUrl = await renderTemplate({
              templateId: template.id,
              brandName,
              logoImg: imageForLogo,
              menuUrl,
              theme,
              subtitle,
            });
            renderedTemplates.push({ ...template, dataUrl });
          }
          return renderedTemplates;
        };

        let rendered;
        try {
          rendered = await renderAllTemplates(logoImg);
        } catch (err) {
          if (!logoImg) throw err;
          console.warn("Logo could not be exported into QR posters, falling back to initials:", err);
          rendered = await renderAllTemplates(null);
          if (!cancelled) {
            setMessage("Logo could not be embedded in the PDF preview, so initials were used.");
          }
        }

        if (cancelled) return;
        setOptions(rendered);
        setSelectedTemplate((current) =>
          rendered.some((option) => option.id === current)
            ? current
            : rendered[0]?.id || "classic"
        );
      } catch (err) {
        console.error("Error generating QR graphics:", err);
        if (!cancelled) {
          setMessage("Error generating QR graphics. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setGenerating(false);
        }
      }
    };

    if (menuUrl) {
      generateOptions();
    }

    return () => {
      cancelled = true;
    };
  }, [brandName, logoImageUrl, menuUrl, refreshKey, subtitle, theme]);

  const handleSave = () => {
    if (!selectedOption) {
      setMessage("Choose a QR design before saving.");
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      pdf.addImage(selectedOption.dataUrl, "PNG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
      pdf.save(`${slugify(brandName)}-${selectedOption.id}-qr.pdf`);
      setMessage("Saved selected QR design as PDF.");
    } catch (err) {
      console.error("Error saving QR PDF:", err);
      setMessage("Error saving PDF. Please try again.");
    }
  };

  return (
    <div className="admin-narrow-page qr-generator-page" style={styles.wrapper}>
      <h1 style={styles.heading}>QR Code Generator</h1>
      <p style={styles.subtext}>
        Printable QR graphics for {brandName}.
      </p>

      <div
        className="glass-panel"
        data-admin-panel="wide"
        style={styles.panel}
      >
        <div style={styles.summaryRow}>
          <div style={styles.brandSummary}>
            <div style={styles.logoPreview}>
              {logoImageUrl ? (
                <img
                  src={buildImageUrl(logoImageUrl)}
                  alt={brandName}
                  style={styles.logoImage}
                />
              ) : (
                <span>{getInitials(brandName)}</span>
              )}
            </div>
            <div>
              <span style={styles.kicker}>Cafe or Hotel Name</span>
              <strong style={styles.brandName}>{brandName}</strong>
            </div>
          </div>

          <div style={styles.linkBox}>
            <span style={styles.kicker}>Menu Link</span>
            <span style={styles.linkText}>{menuUrl}</span>
          </div>
        </div>

        <div className="qr-template-grid" style={styles.optionGrid}>
          {templateDefinitions.map((template) => {
            const option = options.find((item) => item.id === template.id);
            const isSelected = selectedTemplate === template.id;

            return (
              <button
                key={template.id}
                type="button"
                className="qr-template-card"
                onClick={() => setSelectedTemplate(template.id)}
                style={{
                  ...styles.optionCard,
                  borderColor: isSelected ? theme.primary : "rgba(139, 90, 43, 0.16)",
                  boxShadow: isSelected
                    ? "0 14px 28px rgba(139, 90, 43, 0.18)"
                    : "0 8px 22px rgba(15, 23, 42, 0.05)",
                }}
              >
                <div style={styles.previewFrame}>
                  {option ? (
                    <img
                      src={option.dataUrl}
                      alt={`${template.name} preview`}
                      style={styles.previewImage}
                    />
                  ) : (
                    <span style={styles.previewPlaceholder}>
                      {generating ? "Generating..." : "Preview unavailable"}
                    </span>
                  )}
                </div>
                <div style={styles.optionFooter}>
                  <span>
                    <strong>{template.name}</strong>
                    <small style={styles.optionTone}>{template.tone}</small>
                  </span>
                  <span
                    style={{
                      ...styles.selectedPill,
                      backgroundColor: isSelected ? theme.primary : "rgba(107, 114, 128, 0.1)",
                      color: isSelected ? "#ffffff" : "#6B7280",
                    }}
                  >
                    {isSelected ? "Selected" : "Select"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="qr-button-row" style={styles.buttonRow}>
          <button
            type="button"
            onClick={() => setRefreshKey((current) => current + 1)}
            className="glass-btn"
            style={styles.secondaryButton}
            disabled={generating}
          >
            {generating ? "Generating..." : "Regenerate Options"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="glass-btn glass-btn-primary"
            style={{
              ...styles.primaryButton,
              backgroundColor: theme.primary,
              borderColor: theme.primary,
            }}
            disabled={generating || !selectedOption}
          >
            Save Selected PDF
          </button>
        </div>

        {message && <p style={styles.feedback}>{message}</p>}
      </div>
    </div>
  );
};

export default QrGenerator;

const styles = {
  wrapper: {
    maxWidth: "1120px",
    width: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    fontFamily: '"Outfit", sans-serif',
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
  panel: {
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    padding: "24px",
    marginTop: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  brandSummary: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: 0,
  },
  logoPreview: {
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    border: "1px solid rgba(139, 90, 43, 0.16)",
    backgroundColor: "#ffffff",
    color: "#8B5A2B",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flex: "0 0 auto",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  kicker: {
    display: "block",
    fontSize: "0.76rem",
    fontWeight: 800,
    color: "#8B5A2B",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "4px",
  },
  brandName: {
    display: "block",
    color: "#1F2937",
    fontSize: "1.1rem",
    lineHeight: 1.2,
  },
  linkBox: {
    maxWidth: "520px",
    minWidth: "260px",
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid rgba(139, 90, 43, 0.12)",
    backgroundColor: "rgba(255, 255, 255, 0.48)",
  },
  linkText: {
    display: "block",
    color: "#374151",
    fontSize: "0.84rem",
    overflowWrap: "anywhere",
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },
  optionCard: {
    border: "1px solid",
    backgroundColor: "rgba(255, 255, 255, 0.66)",
    borderRadius: "12px",
    padding: "10px",
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    minWidth: 0,
  },
  previewFrame: {
    aspectRatio: "210 / 297",
    width: "100%",
    borderRadius: "8px",
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    border: "1px solid rgba(139, 90, 43, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  previewPlaceholder: {
    color: "#9CA3AF",
    fontSize: "0.88rem",
  },
  optionFooter: {
    marginTop: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    color: "#1F2937",
  },
  selectedPill: {
    borderRadius: "999px",
    padding: "5px 10px",
    fontSize: "0.74rem",
    fontWeight: 800,
    flex: "0 0 auto",
  },
  optionTone: {
    display: "block",
    marginTop: "3px",
    color: "#6B7280",
    fontSize: "0.78rem",
    fontWeight: 600,
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
  },
  primaryButton: {
    flex: 1,
    color: "#ffffff",
  },
  secondaryButton: {
    flex: 1,
  },
  feedback: {
    margin: 0,
    marginTop: "2px",
    fontSize: "0.9rem",
    color: "#8B5A2B",
    fontWeight: "600",
    textAlign: "center",
  },
};
