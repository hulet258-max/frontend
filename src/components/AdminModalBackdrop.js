import React, { useEffect, useState } from "react";

const getAdminContentBounds = () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const content = document.querySelector(".admin-content");
  if (!content) {
    return {
      top: 0,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  const rect = content.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
};

const AdminModalBackdrop = ({
  children,
  backgroundColor = "rgba(15,23,42,0.45)",
  onClick,
}) => {
  const [bounds, setBounds] = useState(getAdminContentBounds);

  useEffect(() => {
    const updateBounds = () => {
      setBounds(getAdminContentBounds());
    };

    updateBounds();
    window.addEventListener("resize", updateBounds);
    window.addEventListener("scroll", updateBounds, true);

    return () => {
      window.removeEventListener("resize", updateBounds);
      window.removeEventListener("scroll", updateBounds, true);
    };
  }, []);

  const frame = bounds || {
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
  };

  return (
    <div
      className="admin-modal-backdrop"
      style={{
        position: "fixed",
        top: frame.top,
        left: frame.left,
        width: frame.width,
        height: frame.height,
        backgroundColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: "24px",
        overflow: "hidden",
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default AdminModalBackdrop;
