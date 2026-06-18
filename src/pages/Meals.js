import React, { useEffect, useMemo, useState } from "react";

const MEALS = ["Breakfast", "Lunch", "Dinner"];

const Meals = ({ categories }) => {
  const [activeMeal, setActiveMeal] = useState(MEALS[0]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const allProducts = useMemo(() => {
    const list = [];
    (categories || []).forEach((cat) => {
      (cat.products || []).forEach((p) => {
        if (p.id) {
          list.push({
            id: p.id,
            name: p.name,
            categoryName: cat.name,
          });
        }
      });
    });
    return list;
  }, [categories]);

  useEffect(() => {
    const fetchMeal = async () => {
      setLoading(true);
      setMessage("");
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/home/meal-category?meal=${encodeURIComponent(
            activeMeal
          )}`
        );
        const data = await res.json();
        const ids = new Set((data.productIds || []).filter(Boolean));
        setSelectedIds(ids);
      } catch (err) {
        console.error("Error loading meal category:", err);
        setSelectedIds(new Set());
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [activeMeal]);

  const toggleProduct = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/home/meal-category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal: activeMeal,
          productIds: Array.from(selectedIds),
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to save meal category");
      }
      setMessage("Meal list saved.");
    } catch (err) {
      console.error("Error saving meal category:", err);
      setMessage("Error saving meal list. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-narrow-page" style={styles.wrapper}>
      <h1 style={styles.heading}>Meals Assignment</h1>
      <p style={styles.subtext}>
        Choose which products belong to each meal (Breakfast, Lunch, Dinner).
      </p>

      <div
        className="glass-panel"
        data-admin-panel="narrow"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.35)",
          padding: 24,
          marginTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div className="meal-tabs" style={styles.mealTabs}>
          {MEALS.map((meal) => {
            const isActive = activeMeal === meal;
            return (
              <button
                key={meal}
                type="button"
                onClick={() => setActiveMeal(meal)}
                style={{
                  ...styles.mealTab,
                  borderColor: isActive ? "#8B5A2B" : "rgba(139, 90, 43, 0.15)",
                  backgroundColor: isActive ? "#8B5A2B" : "rgba(255, 255, 255, 0.4)",
                  color: isActive ? "#ffffff" : "#1f2937",
                }}
              >
                {meal}
              </button>
            );
          })}
        </div>

        {loading ? (
          <p style={styles.helper}>Loading {activeMeal} list...</p>
        ) : (
          <div className="custom-scrollbar admin-scroll-list" style={styles.listBox}>
            {allProducts.length === 0 ? (
              <p style={styles.helper}>No products available.</p>
            ) : (
              allProducts.map((p) => {
                const inMeal = selectedIds.has(p.id);
                return (
                  <div className="meal-product-row" key={p.id} style={styles.row}>
                    <div style={styles.rowInfo}>
                      <span style={styles.rowName}>{p.name}</span>
                      <span style={styles.rowCategory}>{p.categoryName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleProduct(p.id)}
                      style={{
                        ...styles.rowButton,
                        ...(inMeal ? styles.rowButtonActive : {}),
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

        <div style={styles.actions}>
          <button
            type="button"
            onClick={handleSave}
            className="glass-btn glass-btn-primary"
            style={styles.saveButton}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Selection"}
          </button>
        </div>

        {message && <p style={styles.feedback}>{message}</p>}
      </div>
    </div>
  );
};

export default Meals;

const styles = {
  wrapper: {
    maxWidth: "720px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
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
  mealTabs: {
    display: "flex",
    gap: 8,
    justifyContent: "center",
  },
  mealTab: {
    padding: "6px 14px",
    borderRadius: 999,
    border: "1px solid",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: 600,
    transition: "all 0.2s ease",
  },
  listBox: {
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    maxHeight: 360,
    overflowY: "auto",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 14px",
    borderBottom: "1px solid rgba(139, 90, 43, 0.06)",
    fontSize: "0.9rem",
  },
  rowInfo: {
    display: "flex",
    flexDirection: "column",
  },
  rowName: {
    fontWeight: 600,
    color: "#1f2937",
  },
  rowCategory: {
    fontSize: "0.8rem",
    color: "#6b7280",
    marginTop: 2,
  },
  rowButton: {
    padding: "4px 12px",
    borderRadius: 999,
    border: "1px solid rgba(139, 90, 43, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    color: "#1f2937",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  rowButtonActive: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "#059669",
    color: "#059669",
  },
  helper: {
    marginTop: 8,
    fontSize: "0.85rem",
    color: "#6b7280",
    textAlign: "center",
  },
  actions: {
    marginTop: 8,
  },
  saveButton: {
    width: "100%",
    padding: "10px",
  },
  feedback: {
    marginTop: 8,
    fontSize: "0.9rem",
    color: "#8B5A2B",
    fontWeight: 600,
    textAlign: "center",
  },
};
