import React, { useEffect, useMemo, useState } from "react";
import AdminModalBackdrop from "./AdminModalBackdrop";

const BestWithModal = ({ isOpen, onClose, mainProduct, allProducts }) => {
  const [bestWith, setBestWith] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const theme = {
    bg: "#00000099",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    primary: "#8B5A2B",
    textMain: "#111827",
    textMuted: "#6B7280",
  };

  const otherProducts = useMemo(() => {
    if (!mainProduct) return [];
    return (allProducts || []).filter((p) => p.id && p.id !== mainProduct.id);
  }, [allProducts, mainProduct]);

  useEffect(() => {
    const fetchRelations = async () => {
      if (!isOpen || !mainProduct || !mainProduct.id) {
        setBestWith([]);
        return;
      }
      setLoadingRelations(true);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/api/home/best-with?mainId=${encodeURIComponent(
            mainProduct.id
          )}`
        );
        const data = await res.json();
        setBestWith(data.items || []);
      } catch (e) {
        console.error("Error loading best-with relations", e);
        setBestWith([]);
      } finally {
        setLoadingRelations(false);
      }
    };

    fetchRelations();
  }, [isOpen, mainProduct]);

  const hasRelation = (target) => {
    return bestWith.some(
      (r) => r.relatedId && target.id && r.relatedId === target.id
    );
  };

  const handleAddRelation = async (target) => {
    if (!mainProduct || !mainProduct.id || !target.id) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/home/best-with`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mainId: mainProduct.id,
            relatedId: target.id,
          }),
        }
      );
      if (!res.ok) {
        console.error("Failed to save best-with relation");
        return;
      }
      setBestWith((prev) => [
        ...prev,
        {
          mainId: mainProduct.id,
          relatedId: target.id,
        },
      ]);
      setConfirmation("Added relation");
      setTimeout(() => setConfirmation(""), 2000);
    } catch (e) {
      console.error("Error saving best-with relation", e);
    }
  };

  const handleRemoveRelation = async (target) => {
    if (!mainProduct || !mainProduct.id || !target.id) return;
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/home/best-with`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mainId: mainProduct.id,
            relatedId: target.id,
          }),
        }
      );
      if (!res.ok) {
        console.error("Failed to remove best-with relation");
        return;
      }
      setBestWith((prev) =>
        prev.filter((r) => !(r.relatedId && r.relatedId === target.id))
      );
      setConfirmation("Removed relation");
      setTimeout(() => setConfirmation(""), 2000);
    } catch (e) {
      console.error("Error removing best-with relation", e);
    }
  };

  if (!isOpen || !mainProduct) return null;

  return (
    <AdminModalBackdrop backgroundColor={theme.bg} onClick={onClose}>
      <div
        className="best-with-modal-surface"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(800px, 95vw)",
          maxHeight: "calc(100% - 48px)",
          backgroundColor: theme.surface,
          borderRadius: 12,
          border: `1px solid ${theme.border}`,
          boxShadow:
            "0 10px 30px rgba(15, 23, 42, 0.25)",
          padding: 18,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.1rem" }}>
              Best with for {mainProduct.name}
            </h2>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "0.85rem",
                color: theme.textMuted,
              }}
            >
              {mainProduct.categoryName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              color: theme.textMuted,
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        {loadingRelations && (
          <span style={{ fontSize: "0.8rem", color: theme.textMuted }}>
            Loading existing relations...
          </span>
        )}
        {confirmation && (
          <p
            style={{
              marginTop: 0,
              marginBottom: 4,
              fontSize: "0.8rem",
              color: theme.primary,
            }}
          >
            {confirmation}
          </p>
        )}
        <p
          style={{
            marginTop: 0,
            marginBottom: 8,
            fontSize: "0.85rem",
            color: theme.textMuted,
          }}
        >
          Add or remove products that go best with this one.
        </p>

        <div
          style={{
            borderRadius: 10,
            border: `1px solid ${theme.border}`,
            backgroundColor: "#F9FAFB",
            padding: "8px 10px 10px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {otherProducts.map((p) => {
            const linked = hasRelation(p);
            return (
              <div
                className="best-with-row"
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 4px",
                  borderBottom: `1px solid ${theme.border}`,
                  fontSize: "0.85rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        objectFit: "cover",
                        border: `1px solid ${theme.border}`,
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ color: theme.textMuted }}>{p.categoryName}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    linked ? handleRemoveRelation(p) : handleAddRelation(p)
                  }
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: linked
                      ? `1px solid ${theme.primary}`
                      : "none",
                    backgroundColor: linked ? "#FFFFFF" : theme.primary,
                    color: linked ? theme.primary : "#FFFFFF",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    minWidth: 70,
                  }}
                >
                  {linked ? "Remove" : "+ Best with"}
                </button>
              </div>
            );
          })}

          {otherProducts.length === 0 && (
            <p
              style={{
                margin: 0,
                fontSize: "0.85rem",
                color: theme.textMuted,
              }}
            >
              No other products available.
            </p>
          )}
        </div>
      </div>
    </AdminModalBackdrop>
  );
};

export default BestWithModal;
