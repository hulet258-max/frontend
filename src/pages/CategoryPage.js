import React, { useState } from "react";
import AddProductModal from "../components/AddProductModal";
import ProductDetailModal from "../components/ProductDetailModal";

const CategoryPage = ({
  categories,
  onAddCategory,
  onDeleteCategory,
  onEditCategory,
  selectedCategoryIndex,
  onSelectCategory,
  onAddProductToCategory,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [newCatName, setNewCatName] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'

  // Modern Cafe Theme Palette
  const theme = {
    bg: "#F9FAFB",
    sidebarBg: "#FFFFFF",
    primary: "#8B5A2B", // Espresso Brown
    primaryHover: "#6F4822",
    accent: "#D97706",  // Warm Amber
    danger: "#EF4444",
    textMain: "#1F2937",
    textMuted: "#6B7280",
    border: "#E5E7EB",
    surface: "#FFFFFF",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    onAddCategory(newCatName.trim());
    setNewCatName("");
  };

  const startEdit = (index, name) => {
    setEditingIndex(index);
    setEditValue(name);
  };

  const saveEdit = (index) => {
    if (!editValue.trim()) return;
    onEditCategory(index, editValue.trim());
    setEditingIndex(null);
  };

  const openProductModal = () => {
    if (selectedCategoryIndex == null || !categories[selectedCategoryIndex]) return;
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => setIsProductModalOpen(false);

  const openProductDetail = (prodIndex) => {
    setSelectedProductIndex(prodIndex);
    setIsProductDetailOpen(true);
  };

  const closeProductDetail = () => {
    setIsProductDetailOpen(false);
    setSelectedProductIndex(null);
  };

  const toggleProductAvailability = (prodIndex) => {
    if (selectedCategoryIndex == null) return;
    const cat = categories[selectedCategoryIndex];
    if (!cat || !cat.products || !cat.products[prodIndex]) return;
    const prod = cat.products[prodIndex];
    const current = prod.isavailabel ?? prod.isAvailable ?? true;
    onEditProduct(selectedCategoryIndex, prodIndex, { isavailabel: !current });
  };

  return (
    <div
      className="category-admin-layout"
      style={{
        display: "flex",
        flex: 1,
        minHeight: "0",
        backgroundColor: "transparent",
        fontFamily: '"Outfit", sans-serif',
        color: theme.textMain,
        gap: "24px",
      }}
    >
      {/* Left Sidebar: Categories */}
      <div
        className="glass-panel"
        data-admin-section="category-list"
        style={{
          width: "280px",
          backgroundColor: "rgba(255, 255, 255, 0.35)",
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          boxSizing: "border-box",
          flexShrink: 0,
        }}
      >
        <div style={{ padding: "8px 8px 16px" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700", color: theme.primary }}>Menu Categories</h2>
          <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: theme.textMuted }}>
            Manage category offerings
          </p>
        </div>

        {/* Add Category Form */}
        <div style={{ padding: "0 8px 16px", borderBottom: `1px solid rgba(139, 90, 43, 0.1)` }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
            <input
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "8px",
                border: `1px solid ${theme.border}`,
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                outline: "none",
                fontSize: "0.875rem",
                transition: "all 0.2s",
              }}
              placeholder="e.g., Beverages"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = theme.primary)}
              onBlur={(e) => (e.target.style.borderColor = theme.border)}
            />
            <button
              type="submit"
              className="glass-btn glass-btn-primary"
              style={{
                padding: "0 14px",
                fontSize: "0.85rem",
                borderRadius: "8px",
              }}
            >
              Add
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="custom-scrollbar" style={{ overflowY: "auto", flex: 1, padding: "16px 4px 4px" }}>
          {categories.length === 0 && (
            <div style={{ textAlign: "center", padding: "20px", color: theme.textMuted, fontSize: "0.9rem" }}>
              No categories yet.
            </div>
          )}

          {categories.map((cat, catIndex) => {
            const isSelected = selectedCategoryIndex === catIndex;
            return (
              <div
                key={catIndex}
                onClick={() => onSelectCategory(catIndex)}
                style={{
                  padding: "10px 14px",
                  marginBottom: "8px",
                  borderRadius: "10px",
                  backgroundColor: isSelected ? "rgba(139, 90, 43, 0.1)" : "transparent",
                  color: isSelected ? theme.primary : theme.textMain,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  borderLeft: isSelected ? `4px solid ${theme.primary}` : "4px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.35)";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div style={{ flex: 1 }}>
                  {editingIndex === catIndex ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(catIndex)}
                      style={{
                        padding: "6px 8px",
                        borderRadius: "4px",
                        border: `1px solid ${theme.primary}`,
                        width: "80%",
                        outline: "none",
                      }}
                    />
                  ) : (
                    <span style={{ fontWeight: isSelected ? "600" : "500", fontSize: "0.95rem" }}>
                      {cat.name}
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  {editingIndex === catIndex ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveEdit(catIndex);
                      }}
                      style={{ background: "#10B981", color: "#fff", border: "none", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }}
                    >
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(catIndex, cat.name);
                        }}
                        style={{ background: "transparent", color: theme.textMuted, border: "none", cursor: "pointer", fontSize: "0.85rem", padding: "4px" }}
                        title="Edit Category"
                      >
                        ✎
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCategory(catIndex);
                        }}
                        style={{ background: "transparent", color: theme.danger, border: "none", cursor: "pointer", fontSize: "0.85rem", padding: "4px" }}
                        title="Delete Category"
                      >
                        🗑
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content: Products Preview */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "0", overflow: "hidden" }}>
        {selectedCategoryIndex === null || !categories[selectedCategoryIndex] ? (
          <div className="glass-panel" style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", color: theme.textMuted, backgroundColor: "rgba(255, 255, 255, 0.35)" }}>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontSize: "1.25rem", margin: "0 0 8px", color: theme.textMain }}>No Category Selected</h3>
              <p>Select a category from the sidebar to manage products.</p>
            </div>
          </div>
        ) : (
          <div className="category-products-pane" style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: "0" }}>
            {/* Header Section */}
            <div className="category-product-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h1 style={{ margin: "0 0 4px", fontSize: "1.6rem", fontWeight: "700", color: theme.primary }}>
                  {categories[selectedCategoryIndex].name}
                </h1>
                {categories[selectedCategoryIndex].description && (
                  <p style={{ margin: 0, color: theme.textMuted, fontSize: "0.9rem" }}>
                    {categories[selectedCategoryIndex].description}
                  </p>
                )}
              </div>
              <button
                onClick={openProductModal}
                className="glass-btn glass-btn-primary"
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                }}
              >
                ＋ Add Product
              </button>
            </div>

            {/* View toggle */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "8px",
                marginBottom: "12px",
                fontSize: "0.85rem",
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode("list")}
                style={{
                  padding: "4px 12px",
                  borderRadius: "999px",
                  border: "1px solid",
                  borderColor: viewMode === "list" ? theme.primary : "rgba(139, 90, 43, 0.15)",
                  backgroundColor: viewMode === "list" ? "rgba(139, 90, 43, 0.1)" : "rgba(255, 255, 255, 0.4)",
                  color: viewMode === "list" ? theme.primary : theme.textMuted,
                  cursor: "pointer",
                  fontWeight: viewMode === "list" ? "600" : "500",
                }}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                style={{
                  padding: "4px 12px",
                  borderRadius: "999px",
                  border: "1px solid",
                  borderColor: viewMode === "grid" ? theme.primary : "rgba(139, 90, 43, 0.15)",
                  backgroundColor: viewMode === "grid" ? "rgba(139, 90, 43, 0.1)" : "rgba(255, 255, 255, 0.4)",
                  color: viewMode === "grid" ? theme.primary : theme.textMuted,
                  cursor: "pointer",
                  fontWeight: viewMode === "grid" ? "600" : "500",
                }}
              >
                Grid
              </button>
            </div>

            {/* Products Table/List or Grid */}
            <div
              className="glass-panel custom-scrollbar"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.35)",
                boxShadow: "none",
                flex: 1,
                overflowY: "auto",
                border: "1px solid rgba(255, 255, 255, 0.5)",
              }}
            >
              {(!categories[selectedCategoryIndex].products ||
                categories[selectedCategoryIndex].products.length === 0) && (
                <div style={{ padding: "40px", textAlign: "center", color: theme.textMuted }}>
                  No products added to this category yet.
                </div>
              )}

              {categories[selectedCategoryIndex].products &&
                categories[selectedCategoryIndex].products.length > 0 && (
                  <>
                    {viewMode === "list" && (
                      <>
                        <div
                          className="product-list-header"
                          style={{
                            padding: "14px 20px",
                            borderBottom: `1px solid rgba(139, 90, 43, 0.1)`,
                            backgroundColor: "rgba(255, 255, 255, 0.3)",
                            display: "flex",
                          }}
                        >
                          <span
                            style={{
                              flex: 3,
                              fontWeight: "600",
                              color: theme.textMuted,
                              fontSize: "0.8rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            Item
                          </span>
                          <span
                            style={{
                              flex: 1,
                              fontWeight: "600",
                              color: theme.textMuted,
                              fontSize: "0.8rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              textAlign: "center",
                            }}
                          >
                            Status
                          </span>
                          <span
                            style={{
                              flex: 1,
                              fontWeight: "600",
                              color: theme.textMuted,
                              fontSize: "0.8rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              textAlign: "right",
                            }}
                          >
                            Price
                          </span>
                        </div>

                        <div style={{ padding: 0 }}>
                          {categories[selectedCategoryIndex].products.map(
                            (prod, index) => {
                              const isAvailable =
                                prod.isavailabel ?? prod.isAvailable ?? true;
                              return (
                                <div
                                  className="product-list-row"
                                  key={index}
                                  onClick={() => openProductDetail(index)}
                                  style={{
                                    display: "flex",
                                    padding: "12px 20px",
                                    borderBottom:
                                      index !==
                                      categories[selectedCategoryIndex].products
                                        .length - 1
                                        ? `1px solid rgba(139, 90, 43, 0.08)`
                                        : "none",
                                    cursor: "pointer",
                                    transition: "background 0.2s",
                                    alignItems: "center",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "rgba(255, 255, 255, 0.25)")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      "transparent")
                                  }
                                >
                                  <div
                                    className="product-list-item-cell"
                                    style={{
                                      flex: 3,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "12px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        width: "28px",
                                        height: "28px",
                                        borderRadius: "50%",
                                        backgroundColor: "rgba(139, 90, 43, 0.12)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "0.75rem",
                                        color: theme.primary,
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {index + 1}
                                    </div>
                                    {(prod.imageUrl || prod.image) && (
                                      <img
                                        src={prod.imageUrl || prod.image}
                                        alt={prod.name}
                                        style={{
                                          width: "56px",
                                          height: "56px",
                                          borderRadius: "8px",
                                          objectFit: "cover",
                                          border: "1px solid rgba(255, 255, 255, 0.5)",
                                          backgroundColor: "rgba(255, 255, 255, 0.2)",
                                        }}
                                      />
                                    )}
                                    <span
                                      style={{
                                        fontWeight: "500",
                                        color: theme.textMain,
                                      }}
                                    >
                                      {prod.name}
                                    </span>
                                  </div>

                                  <div
                                    className="product-list-status-cell"
                                    style={{
                                      flex: 1,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleProductAvailability(index);
                                      }}
                                      style={{
                                        padding: "4px 12px",
                                        borderRadius: "999px",
                                        border: "none",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        backgroundColor: isAvailable
                                          ? "rgba(16, 185, 129, 0.12)"
                                          : "rgba(107, 114, 128, 0.1)",
                                        color: isAvailable
                                          ? "#059669"
                                          : theme.textMuted,
                                      }}
                                    >
                                      {isAvailable ? "Available" : "Hidden"}
                                    </button>
                                  </div>

                                  <div
                                    className="product-list-price-cell"
                                    style={{
                                      flex: 1,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "flex-end",
                                      fontWeight: "600",
                                      color: theme.textMain,
                                    }}
                                  >
                                    ${Number(prod.price).toFixed(2)}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </>
                    )}

                    {viewMode === "grid" && (
                      <div
                        className="product-grid"
                        style={{
                          padding: "16px",
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(200px, 1fr))",
                          gap: "14px",
                        }}
                      >
                        {categories[selectedCategoryIndex].products.map(
                          (prod, index) => {
                            const isAvailable =
                              prod.isavailabel ?? prod.isAvailable ?? true;
                            return (
                              <div
                                key={index}
                                onClick={() => openProductDetail(index)}
                                style={{
                                  borderRadius: "12px",
                                  border: "1px solid rgba(255, 255, 255, 0.4)",
                                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                                  padding: "10px",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.45)";
                                  e.currentTarget.style.transform = "translateY(-2px)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
                                  e.currentTarget.style.transform = "translateY(0)";
                                }}
                              >
                                {(prod.imageUrl || prod.image) && (
                                  <img
                                    src={prod.imageUrl || prod.image}
                                    alt={prod.name}
                                    style={{
                                      width: "100%",
                                      height: "120px",
                                      borderRadius: "8px",
                                      objectFit: "cover",
                                      border: "1px solid rgba(255, 255, 255, 0.3)",
                                      marginBottom: "8px",
                                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                                    }}
                                  />
                                )}
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "4px",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontWeight: 600,
                                      fontSize: "0.95rem",
                                      color: theme.textMain,
                                    }}
                                  >
                                    {prod.name}
                                  </div>
                                  <span
                                    style={{
                                      fontSize: "0.75rem",
                                      color: theme.textMuted,
                                    }}
                                  >
                                    #{index + 1}
                                  </span>
                                </div>
                                {prod.description && (
                                  <p
                                    style={{
                                      margin: 0,
                                      marginBottom: "8px",
                                      fontSize: "0.8rem",
                                      color: theme.textMuted,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {prod.description}
                                  </p>
                                )}
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginTop: "4px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontWeight: 700,
                                      color: theme.primary,
                                    }}
                                  >
                                    ${Number(prod.price).toFixed(2)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleProductAvailability(index);
                                    }}
                                    style={{
                                      padding: "3px 9px",
                                      borderRadius: "999px",
                                      border: "none",
                                      fontSize: "0.7rem",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      backgroundColor: isAvailable
                                        ? "rgba(16, 185, 129, 0.12)"
                                        : "rgba(107, 114, 128, 0.1)",
                                      color: isAvailable
                                        ? "#059669"
                                        : theme.textMuted,
                                    }}
                                  >
                                    {isAvailable ? "Available" : "Hidden"}
                                  </button>
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        )}

        {/* Modals */}
        <AddProductModal
          isOpen={isProductModalOpen}
          categoryName={categories[selectedCategoryIndex]?.name}
          onClose={closeProductModal}
          onSave={(prod) => {
            onAddProductToCategory(selectedCategoryIndex, prod);
            closeProductModal();
          }}
        />

        <ProductDetailModal
          isOpen={isProductDetailOpen}
          product={
            selectedProductIndex != null &&
            categories[selectedCategoryIndex] &&
            categories[selectedCategoryIndex].products
              ? categories[selectedCategoryIndex].products[selectedProductIndex]
              : null
          }
          onClose={closeProductDetail}
          onSave={(updated) => {
            if (selectedProductIndex != null && selectedCategoryIndex != null) {
              onEditProduct(selectedCategoryIndex, selectedProductIndex, updated);
            }
            closeProductDetail();
          }}
          onDelete={() => {
            if (selectedProductIndex != null && selectedCategoryIndex != null) {
              onDeleteProduct(selectedCategoryIndex, selectedProductIndex);
            }
            closeProductDetail();
          }}
        />
      </div>
    </div>
  );
};

export default CategoryPage;
