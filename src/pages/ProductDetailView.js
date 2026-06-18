import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { defaultTheme, defaultTexts } from "../themeConfig";
import { normalizeMenu, visibleProductsForCategory } from "../utils/menuData";

const hexToRgb = (hex) => {
  if (!hex) return "111, 78, 55";
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
  return "111, 78, 55";
};

const BackIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

const PlateIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value || "";

  return numeric % 1 === 0 ? String(numeric) : numeric.toFixed(2);
};

const ProductDetailView = () => {
  const { catIndex, prodIndex } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState({ categories: [] });
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [theme, setTheme] = useState(defaultTheme);
  const [texts, setTexts] = useState(defaultTexts);

  const lookPreset =
    theme.lookPreset || (theme.isChristmasMode ? "christmas" : "standard");
  const activePrimary =
    theme.isChristmasMode && theme.christmasPrimary
      ? theme.christmasPrimary
      : theme.primary;
  const activeBg =
    theme.isChristmasMode && theme.christmasBg ? theme.christmasBg : theme.bg;
  const activeSecondary =
    theme.secondary ||
    (theme.isChristmasMode && theme.christmasAccent
      ? theme.christmasAccent
      : theme.accent) ||
    activePrimary;
  const activeAccent =
    theme.isChristmasMode && theme.christmasAccent
      ? theme.christmasAccent
      : theme.accent;

  const pageStyle = {
    "--menu-bg": activeBg,
    "--menu-primary": activePrimary,
    "--menu-secondary": activeSecondary,
    "--menu-accent": activeAccent,
    "--menu-surface": theme.surface,
    "--menu-text": theme.textMain,
    "--menu-muted": theme.textMuted,
    "--menu-border": theme.border,
    "--menu-primary-rgb": hexToRgb(activePrimary),
    fontFamily: theme.fontBody,
  };

  const { category, product } = useMemo(() => {
    const cIndex = Number(catIndex);
    const pIndex = Number(prodIndex);
    const selectedCategory = menu.categories?.[cIndex] || null;
    const visibleProducts = visibleProductsForCategory(selectedCategory);

    return {
      category: selectedCategory,
      product: visibleProducts[pIndex] || null,
    };
  }, [menu, catIndex, prodIndex]);

  const buildImageUrl = (url, width = 720) => {
    if (!url) return url;
    const params = `w=${width}&q=auto&f=auto`;
    return url.includes("?") ? `${url}&${params}` : `${url}?${params}`;
  };

  const findProductRoute = (targetProduct) => {
    if (!targetProduct) return null;

    for (let c = 0; c < (menu.categories || []).length; c += 1) {
      const visibleProducts = visibleProductsForCategory(menu.categories[c]);
      const p = visibleProducts.findIndex((item) =>
        targetProduct.id
          ? item.id === targetProduct.id
          : item.name === targetProduct.name
      );

      if (p >= 0) {
        return `/product/${c}/${p}`;
      }
    }

    return null;
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/home`)
      .then((res) => res.json())
      .then((data) => {
        setMenu(normalizeMenu(data));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching menu:", err);
        setLoading(false);
      });

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
      })
      .catch((err) => console.error("Error loading look configuration:", err));
  }, []);

  useEffect(() => {
    if (loading || !product?.id) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setSuggestionsLoading(true);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/home/best-with?mainId=${encodeURIComponent(
            product.id
          )}`
        );
        const data = await res.json();
        const relations = data.items || [];
        const allProducts = [];

        (menu.categories || []).forEach((cat) => {
          visibleProductsForCategory(cat).forEach((item) => {
            allProducts.push(item);
          });
        });

        const resolved = relations
          .map((rel) => allProducts.find((item) => item.id === rel.relatedId))
          .filter(Boolean)
          .slice(0, 2);

        setSuggestions(resolved);
      } catch (err) {
        console.error("Error fetching best-with suggestions:", err);
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    fetchSuggestions();
  }, [loading, menu, product]);

  if (loading) {
    return (
      <div
        className={`product-detail-page menu-preset-${lookPreset}`}
        style={pageStyle}
      >
        <main className="product-detail-shell product-state-shell">
          <p>{texts.loadingTitle}</p>
        </main>
      </div>
    );
  }

  if (!category || !product) {
    return (
      <div
        className={`product-detail-page menu-preset-${lookPreset}`}
        style={pageStyle}
      >
        <main className="product-detail-shell product-state-shell">
          <p>Product not found.</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="product-back-button"
          >
            Back to menu
          </button>
        </main>
      </div>
    );
  }

  const imageUrl = product.imageUrl || product.image;
  const currencySymbol = texts.currencySymbol || "$";

  return (
    <div
      className={`product-detail-page menu-preset-${lookPreset}`}
      style={pageStyle}
    >
      <main className="product-detail-shell">
        <header className="product-detail-topbar">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="product-back-button"
            aria-label="Back to menu"
          >
            <BackIcon />
            <span>Back</span>
          </button>

          <div className="product-brand-block">
            <span>{texts.heroTitle}</span>
            <strong>{category.name}</strong>
          </div>
        </header>

        <section className="product-detail-card">
          <div className="product-detail-image-box">
            {imageUrl ? (
              <img
                src={buildImageUrl(imageUrl)}
                alt={product.name}
                className="product-detail-image"
              />
            ) : (
              <div className="product-detail-image product-detail-image-empty">
                <PlateIcon />
              </div>
            )}
          </div>

          <div className="product-detail-content">
            <span className="product-category-pill">{category.name}</span>
            <h1 style={{ fontFamily: theme.fontHeading }}>{product.name}</h1>
            <p>{product.description || "Freshly prepared from the menu."}</p>

            <div className="product-detail-meta">
              <strong className="product-price-pill">
                {currencySymbol}
                {formatPrice(product.price)}
              </strong>
              <span
                className={`product-availability ${
                  product.isavailabel === false
                    ? "is-unavailable"
                    : "is-available"
                }`}
              >
                {product.isavailabel === false ? "Unavailable" : "Available"}
              </span>
            </div>
          </div>
        </section>

        <section className="product-suggestions-section">
          <div className="product-suggestions-heading">
            <span>Best with this</span>
          </div>

          {suggestionsLoading ? (
            <p className="product-muted-text">Loading suggestions...</p>
          ) : suggestions.length === 0 ? (
            <p className="product-muted-text">No suggestions right now.</p>
          ) : (
            <div className="product-suggestions-grid">
              {suggestions.map((suggestedProduct, idx) => {
                const suggestedImage =
                  suggestedProduct.imageUrl || suggestedProduct.image;
                const route = findProductRoute(suggestedProduct);

                return (
                  <article
                    key={suggestedProduct.id || `${suggestedProduct.name}-${idx}`}
                    className="product-suggestion-card"
                    onClick={() => route && navigate(route)}
                  >
                    {suggestedImage ? (
                      <img
                        src={buildImageUrl(suggestedImage, 420)}
                        alt={suggestedProduct.name}
                      />
                    ) : (
                      <div className="product-suggestion-image-empty">
                        <PlateIcon />
                      </div>
                    )}
                    <div>
                      <h2>{suggestedProduct.name}</h2>
                      <strong>
                        {currencySymbol}
                        {formatPrice(suggestedProduct.price)}
                      </strong>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProductDetailView;
