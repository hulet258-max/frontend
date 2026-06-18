import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { defaultTheme, defaultTexts } from "../themeConfig";
import { normalizeMenu, visibleProductsForCategory } from "../utils/menuData";

const SPECIAL_MEALS = ["Breakfast", "Lunch", "Dinner"];

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

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const PlateIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const FoodBackgroundIcons = () => (
  <div className="public-bg-icons" aria-hidden="true">
    {[0, 1, 2, 3, 4, 5].map((item) => (
      <span key={item}>
        <PlateIcon />
      </span>
    ))}
  </div>
);

const setDocumentIcon = (href) => {
  if (!href) return;

  const selectors = ["link[rel='icon']", "link[rel='shortcut icon']"];
  let iconLink = document.head.querySelector(selectors.join(", "));

  if (!iconLink) {
    iconLink = document.createElement("link");
    iconLink.setAttribute("rel", "icon");
    document.head.appendChild(iconLink);
  }

  iconLink.setAttribute("type", "image/png");
  iconLink.setAttribute("href", href);

  let appleIcon = document.head.querySelector("link[rel='apple-touch-icon']");
  if (!appleIcon) {
    appleIcon = document.createElement("link");
    appleIcon.setAttribute("rel", "apple-touch-icon");
    document.head.appendChild(appleIcon);
  }
  appleIcon.setAttribute("href", href);
};

const formatPrice = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return value || "";

  return numeric % 1 === 0 ? String(numeric) : numeric.toFixed(2);
};

const Menu = () => {
  const [menu, setMenu] = useState({ categories: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState("all");
  const [theme, setTheme] = useState(defaultTheme);
  const [texts, setTexts] = useState(defaultTexts);
  const [mealSpecials, setMealSpecials] = useState([]);
  const [logoImageUrl, setLogoImageUrl] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  const navigate = useNavigate();

  const lookPreset =
    theme.lookPreset || (theme.isChristmasMode ? "christmas" : "standard");

  const allVisibleProducts = useMemo(() => {
    return (menu.categories || []).flatMap((category, categoryIndex) =>
      visibleProductsForCategory(category).map((product, productIndex) => ({
        ...product,
        categoryName: category.name,
        categoryIndex,
        productIndex,
      }))
    );
  }, [menu.categories]);

  const activeCategory =
    selectedCategoryIndex === "all"
      ? null
      : menu.categories?.[selectedCategoryIndex] || null;

  const displayedProducts = useMemo(() => {
    if (selectedCategoryIndex === "all") {
      return allVisibleProducts;
    }

    return visibleProductsForCategory(activeCategory).map((product, productIndex) => ({
      ...product,
      categoryName: activeCategory?.name,
      categoryIndex: selectedCategoryIndex,
      productIndex,
    }));
  }, [activeCategory, allVisibleProducts, selectedCategoryIndex]);

  const groupedVisibleProducts = useMemo(() => {
    return (menu.categories || [])
      .map((category, categoryIndex) => ({
        id: category.id || category.name || categoryIndex,
        name: category.name,
        products: visibleProductsForCategory(category).map((product, productIndex) => ({
          ...product,
          categoryName: category.name,
          categoryIndex,
          productIndex,
        })),
      }))
      .filter((group) => group.products.length > 0);
  }, [menu.categories]);

  const buildImageUrl = (url) => {
    if (!url) return url;
    const params = "w=520&q=auto&f=auto";
    return url.includes("?") ? `${url}&${params}` : `${url}?${params}`;
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 1700);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = texts.heroTitle || defaultTexts.heroTitle;
  }, [texts.heroTitle]);

  useEffect(() => {
    if (logoImageUrl) {
      setDocumentIcon(buildImageUrl(logoImageUrl));
    }
  }, [logoImageUrl]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/home`)
      .then((res) => res.json())
      .then((data) => {
        const normalizedMenu = normalizeMenu(data);
        setMenu(normalizedMenu);
        setSelectedCategoryIndex("all");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching menu:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (allVisibleProducts.length === 0) {
      setMealSpecials([]);
      return;
    }

    let ignore = false;

    const loadMealSpecials = async () => {
      try {
        const mealResults = await Promise.all(
          SPECIAL_MEALS.map(async (meal) => {
            const res = await fetch(
              `${process.env.REACT_APP_API_URL}/api/home/meal-category?meal=${encodeURIComponent(
                meal
              )}`
            );
            const data = await res.json();
            return {
              meal,
              productIds: Array.isArray(data.productIds) ? data.productIds : [],
            };
          })
        );

        if (ignore) return;

        const productById = new Map(
          allVisibleProducts
            .filter((product) => product.id)
            .map((product) => [product.id, product])
        );
        const specials = mealResults
          .flatMap(({ meal, productIds }) =>
            productIds
              .map((id) => productById.get(id))
              .filter(Boolean)
              .map((product) => ({ ...product, meal }))
          )
          .filter(Boolean);

        setMealSpecials(specials.slice(0, 12));
      } catch (err) {
        console.error("Error loading meal specials:", err);
        setMealSpecials([]);
      }
    };

    loadMealSpecials();

    return () => {
      ignore = true;
    };
  }, [allVisibleProducts]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/look`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;

        if (data.theme) {
          setTheme((prev) => ({
            ...prev,
            ...data.theme,
          }));
        } else {
          setTheme((prev) => ({
            ...prev,
            ...(data.primaryColor ? { primary: data.primaryColor } : {}),
            ...(data.secondaryColor ? { bg: data.secondaryColor } : {}),
            ...(data.accentColor ? { accent: data.accentColor } : {}),
            ...(data.isChristmasMode !== undefined
              ? {
                  isChristmasMode: data.isChristmasMode,
                  lookPreset: data.isChristmasMode ? "christmas" : "standard",
                }
              : {}),
          }));
        }

        if (data.texts) {
          setTexts((prev) => ({
            ...prev,
            ...data.texts,
          }));
        } else {
          setTexts((prev) => ({
            ...prev,
            ...(data.title ? { heroTitle: data.title } : {}),
            ...(data.description ? { heroSubtitle: data.description } : {}),
          }));
        }

        if (data.imageUrl) {
          setLogoImageUrl(data.imageUrl);
        }
      })
      .catch((err) => {
        console.error("Error fetching look:", err);
      });
  }, []);

  const renderProductCard = (prod, idx) => {
    const imageUrl = prod.imageUrl || prod.image;

    return (
      <article
        key={prod.id || `${prod.categoryName}-${prod.name}-${idx}`}
        className="public-product-card"
        onClick={() =>
          navigate(`/product/${prod.categoryIndex}/${prod.productIndex}`)
        }
      >
        {imageUrl ? (
          <img
            src={buildImageUrl(imageUrl)}
            alt={prod.name}
            className="public-product-image"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        ) : (
          <div className="public-product-image public-product-image-empty">
            <PlateIcon />
          </div>
        )}
        <div className="public-product-info">
          <div>
            <h3>{prod.name}</h3>
            {prod.description && <p>{prod.description}</p>}
          </div>
          <strong className="public-product-price">
            {texts.currencySymbol}
            {formatPrice(prod.price)}
          </strong>
        </div>
        <span className="public-product-arrow">
          <ArrowIcon />
        </span>
      </article>
    );
  };

  return (
    <div
      className={`public-menu-page menu-preset-${lookPreset}`}
      style={{
        "--menu-bg": theme.bg,
        "--menu-primary": theme.primary,
        "--menu-secondary": theme.secondary || theme.primary,
        "--menu-accent": theme.accent,
        "--menu-surface": theme.surface,
        "--menu-text": theme.textMain,
        "--menu-muted": theme.textMuted,
        "--menu-border": theme.border,
        "--menu-primary-rgb": hexToRgb(theme.primary),
        fontFamily: theme.fontBody,
      }}
    >
      {showSplash && (
        <div className="public-splash-screen">
          <div className="public-splash-content">
            <div className="public-splash-logo">
              {logoImageUrl ? (
                <img
                  src={buildImageUrl(logoImageUrl)}
                  alt={texts.heroTitle}
                  decoding="async"
                />
              ) : (
                <PlateIcon />
              )}
            </div>
            <div className="public-splash-bar">
              <span />
            </div>
          </div>
        </div>
      )}
      <FoodBackgroundIcons />
      <header className="public-menu-header">
        <div className="public-menu-header-main">
          <div className="public-menu-title-block">
            <div className="public-menu-logo">
              {logoImageUrl ? (
                <img
                  src={buildImageUrl(logoImageUrl)}
                  alt={texts.heroTitle}
                  loading="eager"
                  decoding="async"
                />
              ) : (
                <PlateIcon />
              )}
            </div>
            <h1 style={{ fontFamily: theme.fontHeading }}>{texts.heroTitle}</h1>
          </div>
        </div>
        {mealSpecials.length > 0 && (
          <div className="public-specials-strip" aria-label="Meal specials">
            {mealSpecials.map((special, index) => {
              return (
                <article
                  key={special.id || `${special.meal}-${special.name}-${index}`}
                  className="public-special-chip"
                >
                  <div>
                    <strong>{special.name}</strong>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </header>

      <main className="public-menu-shell">
        <section className="public-category-panel">
          <div className="public-category-list">
            <button
              type="button"
              className={`public-category-button ${
                selectedCategoryIndex === "all" ? "is-active" : ""
              }`}
              onClick={() => setSelectedCategoryIndex("all")}
            >
              <span>All</span>
            </button>
            {menu.categories.map((cat, index) => {
              const isActive = index === selectedCategoryIndex;

              return (
                <button
                  key={cat.id || cat.name || index}
                  type="button"
                  className={`public-category-button ${
                    isActive ? "is-active" : ""
                  }`}
                  onClick={() => setSelectedCategoryIndex(index)}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="public-products-panel">
          {loading ? (
            <div className="public-empty-state">
              <h2>{texts.loadingTitle}</h2>
              <p>{texts.loadingDesc}</p>
            </div>
          ) : menu.categories.length === 0 ? (
            <div className="public-empty-state">
              <h2>{texts.emptyMenuTitle}</h2>
              <p>{texts.emptyMenuDesc}</p>
            </div>
          ) : selectedCategoryIndex !== "all" && !activeCategory ? (
            <div className="public-empty-state">
              <h2>{texts.emptyMenuTitle}</h2>
              <p>{texts.emptyMenuDesc}</p>
            </div>
          ) : (
            <>
              {displayedProducts.length === 0 ? (
                <div className="public-empty-state public-empty-state-inline">
                  {texts.emptyCategoryDesc}
                </div>
              ) : (
                selectedCategoryIndex === "all" ? (
                  <div className="public-products-grouped">
                    {groupedVisibleProducts.map((group) => (
                      <section
                        key={group.id}
                        className="public-product-category-section"
                      >
                        <h2>{group.name}</h2>
                        <div className="public-products-grid">
                          {group.products.map(renderProductCard)}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  <div className="public-products-grid">
                    {displayedProducts.map(renderProductCard)}
                  </div>
                )
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Menu;
