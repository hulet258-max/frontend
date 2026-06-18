import React, { useState } from "react";

const sidebarStyles = {
  container: {
    width: "240px",
    backgroundColor: "#18120f", // Deep espresso dark brown
    color: "white",
    display: "flex",
    flexDirection: "column",
    padding: "24px 18px",
    boxSizing: "border-box",
    minHeight: "100vh",
    borderRight: "1px solid rgba(255, 255, 255, 0.05)",
    fontFamily: "'Outfit', sans-serif",
  },
  logo: {
    fontSize: "1.45rem",
    fontWeight: "800",
    marginBottom: "28px",
    fontFamily: "'Playfair Display', serif",
    letterSpacing: "-0.01em",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    paddingBottom: "16px",
    color: "#ffffff",
  },
  navItem: {
    padding: "12px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "6px",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#bcaaa4", // Soft coffee-toned text
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  navItemActive: {
    backgroundColor: "#8B5A2B", // Espresso accent
    color: "#ffffff",
    boxShadow: "0 4px 15px rgba(139, 90, 43, 0.25)",
  },
  navItemDisabled: {
    opacity: 0.35,
    cursor: "default",
  },
};

const AdminSidebar = ({
  activeTab,
  onSelectTab,
  isOpen = false,
  onClose,
  brandTitle = "Brand Name",
}) => {
  const [hoveredId, setHoveredId] = useState(null);

  const items = [
    { id: "category", label: "Menu Items", icon: "☕" },
    { id: "inform", label: "Product Pairings", icon: "🔗" },
    { id: "look", label: "Theme & Look", icon: "🎨" },
    { id: "qr", label: "QR Generator", icon: "📱" },
    { id: "staff", label: "Staff Panel", icon: "👥", disabled: true },
    { id: "resources", label: "Resources", icon: "📦", disabled: true },
  ];

  const handleSelect = (item) => {
    if (item.disabled) return;
    onSelectTab(item.id);
    if (onClose) onClose();
  };

  return (
    <aside
      className={`admin-sidebar ${isOpen ? "admin-sidebar-open" : ""}`}
      style={sidebarStyles.container}
    >
      <div className="admin-sidebar-header">
        <div style={sidebarStyles.logo}>{brandTitle} Admin</div>
        <button
          type="button"
          className="admin-sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <span />
          <span />
        </button>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const isDisabled = item.disabled;
          const isHovered = hoveredId === item.id;

          return (
            <div
              key={item.id}
              style={{
                ...sidebarStyles.navItem,
                ...(isActive ? sidebarStyles.navItemActive : {}),
                ...(isDisabled ? sidebarStyles.navItemDisabled : {}),
                ...(isHovered && !isActive && !isDisabled
                  ? { backgroundColor: "rgba(255, 255, 255, 0.04)", color: "#ffffff" }
                  : {}),
              }}
              onMouseEnter={() => !isDisabled && setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleSelect(item)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
        })}

        {/* Spacer to push bottom section down */}
        <div style={{ flex: 1 }} />

        {/* View Live Menu Link */}
        <div
          style={{
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            textAlign: "center",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "#ffffff",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onClick={() => window.open("/", "_blank")}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.borderColor = "#8B5A2B";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
          }}
        >
          <span>🌐</span> View Live Menu
        </div>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
