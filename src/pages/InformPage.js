import React, { useEffect, useMemo, useState } from "react";
import BestWithModal from "../components/BestWithModal";

const InformPage = ({ categories }) => {
  const [selectedKey, setSelectedKey] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMeal, setActiveMeal] = useState("Breakfast");
  const [selectedMealIds, setSelectedMealIds] = useState(new Set());
  const [mealLoading, setMealLoading] = useState(false);
  const [mealSaving, setMealSaving] = useState(false);
  const [mealMessage, setMealMessage] = useState("");

  const allProducts = useMemo(() => {
    const items = [];
    categories.forEach((cat, ci) => {
      (cat.products || []).forEach((prod, pi) => {
        items.push({
          key: `${ci}-${pi}`,
          id: prod.id,
          categoryIndex: ci,
          productIndex: pi,
          categoryName: cat.name,
          name: prod.name,
          description: prod.description,
          price: prod.price,
          imageUrl: prod.imageUrl || prod.image,
        });
      });
    });
    return items;
  }, [categories]);

  const selectedProduct = useMemo(
    () => allProducts.find((p) => p.key === selectedKey) || null,
    [allProducts, selectedKey]
  );

  const theme = {
    bg: "#F3F4F6",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    primary: "#8B5A2B",
    textMain: "#111827",
    textMuted: "#6B7280",
  };

  // Meals helpers
  const MEALS = ["Breakfast", "Lunch", "Dinner"];

  const handleOpenBestWith = (product) => {
    setSelectedKey(product.key);
    setModalOpen(true);
  };

  const handleCloseBestWith = () => {
    setModalOpen(false);
  };

  // Load meal-category selection when activeMeal changes
  useEffect(() => {
    const fetchMeal = async () => {
      setMealLoading(true);
      setMealMessage("");
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/home/meal-category?meal=${encodeURIComponent(
            activeMeal
          )}`
        );
        const data = await res.json();
        const ids = new Set((data.productIds || []).filter(Boolean));
        setSelectedMealIds(ids);
      } catch (err) {
        console.error("Error loading meal category:", err);
        setSelectedMealIds(new Set());
      } finally {
        setMealLoading(false);
      }
    };

    fetchMeal();
  }, [activeMeal]);

  const toggleMealProduct = (id) => {
    setSelectedMealIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSaveMeal = async () => {
    setMealSaving(true);
    setMealMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/home/meal-category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal: activeMeal,
          productIds: Array.from(selectedMealIds),
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save meal category");
      }
      setMealMessage("Meal list saved.");
    } catch (err) {
      console.error("Error saving meal category:", err);
      setMealMessage("Error saving meal list. Please try again.");
    } finally {
      setMealSaving(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100%",
        backgroundColor: "transparent",
        fontFamily: '"Outfit", sans-serif',
      }}
    >
      <div
        className="inform-grid"
        style={{
          width: "100%",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 24,
        }}
      >
        {/* Left: Best With management */}
        <div
          className="glass-panel"
          data-admin-panel="inform"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.35)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            minHeight: "500px",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "700", color: theme.primary }}>
              Product Pairing (Best With)
            </h2>
            <p
              style={{
                marginTop: 6,
                marginBottom: 0,
                color: theme.textMuted,
                fontSize: "0.9rem",
              }}
            >
              Click a product below to choose which items it goes best with.
            </p>
          </div>

          {allProducts.length === 0 && (
            <p
              style={{
                color: theme.textMuted,
                textAlign: "center",
                marginTop: 16,
              }}
            >
              No products available.
            </p>
          )}

          {allProducts.length > 0 && (
            <div
              className="custom-scrollbar admin-scroll-list"
              style={{
                marginTop: 8,
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.5)",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: 10,
                overflowY: "auto",
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {allProducts.map((p) => (
                  <button
                    className="inform-product-button"
                    key={p.key}
                    type="button"
                    onClick={() => handleOpenBestWith(p)}
                    style={{
                      textAlign: "left",
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid rgba(255, 255, 255, 0.4)",
                      backgroundColor: "rgba(255, 255, 255, 0.5)",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      fontSize: "0.9rem",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.85)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span>
                      <span style={{ fontWeight: 600, color: theme.textMain }}>
                        {p.name}
                      </span>
                      <span style={{ color: theme.textMuted, fontSize: "0.85rem" }}> · {p.categoryName}</span>
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: theme.primary,
                      }}
                    >
                      ${Number(p.price).toFixed(2)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Meals side */}
        <div
          className="glass-panel"
          data-admin-panel="inform"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.35)",
            padding: 24,
            display: "flex",
            flexDirection: "column",
            minHeight: "500px",
          }}
        >
          <div
            style={{
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "700", color: theme.primary }}>
              Meal Specials
            </h2>
            <p
              style={{
                marginTop: 6,
                marginBottom: 0,
                color: theme.textMuted,
                fontSize: "0.9rem",
              }}
            >
              Choose which products belong to each meal: Breakfast, Lunch, Dinner.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 4,
              marginBottom: 12,
              justifyContent: "center",
            }}
          >
            {MEALS.map((meal) => (
              <button
                key={meal}
                type="button"
                onClick={() => setActiveMeal(meal)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "1px solid",
                  borderColor: activeMeal === meal ? theme.primary : "rgba(139, 90, 43, 0.15)",
                  backgroundColor: activeMeal === meal ? theme.primary : "rgba(255, 255, 255, 0.4)",
                  color: activeMeal === meal ? "#ffffff" : theme.textMain,
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
              >
                {meal}
              </button>
            ))}
          </div>

          {mealLoading ? (
            <p
              style={{
                marginTop: 8,
                fontSize: "0.85rem",
                color: theme.textMuted,
                textAlign: "center",
              }}
            >
              Loading {activeMeal} list...
            </p>
          ) : (
            <div
              className="custom-scrollbar admin-scroll-list"
              style={{
                marginTop: 4,
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.5)",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                maxHeight: 320,
                overflowY: "auto",
                flex: 1,
              }}
            >
              {allProducts.length === 0 ? (
                <p
                  style={{
                    margin: 12,
                    fontSize: "0.85rem",
                    color: theme.textMuted,
                  }}
                >
                  No products available.
                </p>
              ) : (
                allProducts.map((p) => {
                  const inMeal = selectedMealIds.has(p.id);
                  return (
                    <div
                      className="meal-product-row"
                      key={p.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        borderBottom: "1px solid rgba(139, 90, 43, 0.06)",
                        fontSize: "0.9rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: theme.textMain,
                          }}
                        >
                          {p.name}
                        </span>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: theme.textMuted,
                            marginTop: 2,
                          }}
                        >
                          {p.categoryName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleMealProduct(p.id)}
                        style={{
                          padding: "4px 12px",
                          borderRadius: 999,
                          border: inMeal
                            ? "1px solid #059669"
                            : "1px solid rgba(139, 90, 43, 0.15)",
                          backgroundColor: inMeal ? "rgba(16, 185, 129, 0.12)" : "rgba(255, 255, 255, 0.4)",
                          color: inMeal ? "#059669" : theme.textMain,
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {inMeal ? "Remove" : "Add"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={handleSaveMeal}
              disabled={mealSaving}
              className="glass-btn glass-btn-primary"
              style={{
                width: "100%",
                padding: "10px",
              }}
            >
              {mealSaving ? "Saving..." : "Save Meal List"}
            </button>
          </div>

          {mealMessage && (
            <p
              style={{
                marginTop: 12,
                fontSize: "0.9rem",
                color: theme.primary,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {mealMessage}
            </p>
          )}
        </div>

        <BestWithModal
          isOpen={modalOpen && !!selectedProduct}
          onClose={handleCloseBestWith}
          mainProduct={selectedProduct}
          allProducts={allProducts}
        />
      </div>
    </div>
  );
};

export default InformPage;
