import React, { useState, useEffect } from "react";
import AdminSidebar from "../components/AdminSidebar";
import CategoryPage from "./CategoryPage";
import InformPage from "./InformPage";
import Looks from "./Looks";
import Meals from "./Meals";
import QrGenerator from "./QrGenerator";
import { defaultTexts } from "../themeConfig";
import { normalizeCategories, productsForCategory } from "../utils/menuData";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("category");
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [brandTitle, setBrandTitle] = useState(defaultTexts.heroTitle);

  const tabLabels = {
    category: "Menu Items",
    inform: "Product Pairings",
    look: "Theme & Look",
    meals: "Meals",
    qr: "QR Generator",
    staff: "Staff",
    resources: "Resources",
  };

  // 🔄 LOAD FROM BACKEND
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/home`)
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) {
          const normalizedCategories = normalizeCategories(data.categories);
          setCategories(normalizedCategories);
          if (normalizedCategories.length > 0) {
            setSelectedCategoryIndex(0);
          }
        }
      })
      .catch((err) => console.error("Error loading menu:", err));
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/look`)
      .then((res) => res.json())
      .then((data) => {
        const nextTitle = data?.texts?.heroTitle || data?.title;
        if (nextTitle) {
          setBrandTitle(nextTitle);
        }
      })
      .catch((err) => console.error("Error loading brand title:", err));
  }, []);


  const saveMenu = async (categoriesToSave = categories) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/home/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categories: categoriesToSave }),
      });

      if (!response.ok) {
        throw new Error("Failed to save menu");
      }

      const data = await response.json();
      if (Array.isArray(data.categories)) {
        const normalizedCategories = normalizeCategories(data.categories);
        setCategories(normalizedCategories);
        setSelectedCategoryIndex((current) => {
          if (normalizedCategories.length === 0) return null;
          if (current === null || current >= normalizedCategories.length) return 0;
          return current;
        });
      }
    } catch (err) {
      console.error("Error saving menu:", err);
    }
  };

  const handleAddCategory = (name) => {
    const next = [...categories, { name, products: [] }];
    setCategories(next);
    if (next.length === 1) {
      setSelectedCategoryIndex(0);
    }
    // also save immediately after add
    saveMenu(next);
  };

  const handleDeleteCategory = (indexToRemove) => {
    const next = categories.filter((_, i) => i !== indexToRemove);
    setCategories(next);
    setSelectedCategoryIndex((current) => {
      if (current === null || next.length === 0) return next.length ? 0 : null;
      if (indexToRemove === current) {
        return Math.min(current, next.length - 1);
      }
      if (indexToRemove < current) {
        return current - 1;
      }
      return current;
    });
    // persist deletion
    saveMenu(next);
  };

  const handleEditCategory = (indexToEdit, newName) => {
    const next = categories.map((cat, i) =>
      i === indexToEdit ? { ...cat, name: newName } : cat
    );
    setCategories(next);
    // persist rename
    saveMenu(next);
  };

  const handleAddProduct = (categoryIndex, product) => {
    const next = categories.map((cat, i) =>
      i === categoryIndex
        ? { ...cat, products: [...productsForCategory(cat), product] }
        : cat
    );
    setCategories(next);
    // also save immediately after add
    saveMenu(next);
  };

  const handleEditProduct = (categoryIndex, productIndex, updatedProduct) => {
    const next = categories.map((cat, i) => {
      if (i !== categoryIndex) return cat;
      const products = [...productsForCategory(cat)];
      products[productIndex] = { ...products[productIndex], ...updatedProduct };
      return { ...cat, products };
    });
    setCategories(next);
    saveMenu(next);
  };

  const handleDeleteProduct = (categoryIndex, productIndex) => {
    const next = categories.map((cat, i) => {
      if (i !== categoryIndex) return cat;
      const products = productsForCategory(cat).filter((_, idx) => idx !== productIndex);
      return { ...cat, products };
    });
    setCategories(next);
    saveMenu(next);
  };

  const handleSelectCategory = (index) => {
    setSelectedCategoryIndex(index);
  };

  const handleSelectTab = (tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  return (
    <div className="admin-shell" style={styles.appShell}>
      {isSidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu"
        />
      )}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        brandTitle={brandTitle}
      />
      <main className="admin-main" style={styles.mainArea}>
        <div className="admin-mobile-topbar">
          <button
            type="button"
            className="admin-menu-button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
          <div>
            <span className="admin-mobile-kicker">{brandTitle} Admin</span>
            <h1>{tabLabels[activeTab] || "Admin"}</h1>
          </div>
        </div>
        <div className="admin-content" style={styles.contentArea}>
          {activeTab === "category" && (
            <CategoryPage
              categories={categories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onEditCategory={handleEditCategory}
              selectedCategoryIndex={selectedCategoryIndex}
              onSelectCategory={handleSelectCategory}
              onAddProductToCategory={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === "inform" && (
            <InformPage categories={categories} />
          )}

          {activeTab === "look" && (
            <Looks />
          )}

          {activeTab === "meals" && (
            <Meals categories={categories} />
          )}

          {activeTab === "qr" && (
            <QrGenerator />
          )}

          {activeTab === "staff" && (
            <div>
              <h1>Staff</h1>
              <p style={{ color: "#6b7280" }}>
                Staff management will be added here later.
              </p>
            </div>
          )}

          {activeTab === "resources" && (
            <div>
              <h1>Resources</h1>
              <p style={{ color: "#6b7280" }}>
                Resource management will be added here later.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;

const styles = {
  appShell: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#f5f3f0", // Warm cream/latte clean base
    fontFamily: "'Outfit', sans-serif",
  },
  mainArea: {
    flex: 1,
    padding: "28px 32px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    overflow: "hidden",
  },
  contentArea: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    padding: "28px",
    boxShadow: "0 10px 30px rgba(139, 90, 43, 0.04)",
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
  },
};
