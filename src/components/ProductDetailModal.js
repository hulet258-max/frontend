import React, { useState, useEffect } from "react";
import AdminModalBackdrop from "./AdminModalBackdrop";

const theme = {
  primary: "#8B5A2B",
  primaryHover: "#6F4822",
  border: "#E5E7EB",
  textMain: "#1F2937",
  textMuted: "#6B7280",
  danger: "#DC2626",
  surface: "#FFFFFF",
};

const ProductDetailModal = ({ isOpen, product, onClose, onSave, onDelete }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    isAvailable: true,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (isOpen && product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        isAvailable: product.isavailabel ?? product.isAvailable ?? true,
      });
      setImagePreview(product.imageUrl || product.image || null);
      setImageData(null);
      setIsUploading(false);
      setUploadError("");
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setImageData(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;

    let imageUrl = product.imageUrl || product.image || null;
    setUploadError("");

    try {
      if (imageData) {
        setIsUploading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/home/upload-image`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: imageData }),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || data.message || "Image upload failed");
        }

        imageUrl = data.url;
      }
    } catch (err) {
      setUploadError(err.message || "Image upload failed");
      return;
    } finally {
      setIsUploading(false);
    }

    onSave({
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price,
      imageUrl,
      image: imageUrl,
      isavailabel: !!form.isAvailable,
    });
  };

  const handleDeleteClick = () => {
    onDelete();
  };

  return (
    <AdminModalBackdrop>
      <div
        className="admin-modal-surface"
        style={{
          backgroundColor: theme.surface,
          borderRadius: "16px",
          padding: "22px 24px",
          width: "100%",
          maxWidth: "520px",
          boxShadow: "0 18px 40px rgba(15,23,42,0.35)",
          border: `1px solid ${theme.border}`,
          fontFamily: '"Inter", "Segoe UI", sans-serif',
          color: theme.textMain,
          maxHeight: "calc(100% - 48px)",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: 600,
                color: theme.primary,
              }}
            >
              Product Details
            </h3>
            <p
              style={{
                margin: 0,
                marginTop: 2,
                fontSize: "0.8rem",
                color: theme.textMuted,
              }}
            >
              View and update this menu item.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            ×
          </button>
        </div>

        {imagePreview && (
          <div style={{ marginBottom: "12px", textAlign: "center" }}>
            <img
              src={imagePreview}
              alt={product.name}
              style={{
                maxHeight: "200px",
                maxWidth: "100%",
                borderRadius: "12px",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "10px" }}
        >
          <input
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: `1px solid ${theme.border}`,
            }}
            placeholder="Product name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: `1px solid ${theme.border}`,
            }}
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
          <input
            type="number"
            style={{
              padding: "8px",
              borderRadius: "6px",
              border: `1px solid ${theme.border}`,
            }}
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />

          <div
            className="admin-modal-actions product-detail-actions"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.9rem",
            }}
          >
            <input
              type="checkbox"
              id="detail-isAvailable"
              checked={form.isAvailable}
              onChange={(e) =>
                setForm({ ...form, isAvailable: e.target.checked })
              }
            />
            <label htmlFor="detail-isAvailable">Available</label>
          </div>

          <input type="file" accept="image/*" onChange={handleFileChange} />

          {uploadError && (
            <p style={{ margin: 0, color: theme.danger, fontSize: "0.82rem" }}>
              {uploadError}
            </p>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "8px",
            }}
          >
            <button
              type="button"
              onClick={handleDeleteClick}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: `1px solid ${theme.danger}`,
                backgroundColor: "white",
                color: theme.danger,
                cursor: "pointer",
              }}
            >
              Delete
            </button>

            <div className="admin-modal-action-group" style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.border}`,
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "8px 14px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: theme.primary,
                  color: "white",
                  cursor: "pointer",
                }}
                disabled={isUploading}
              >
                {isUploading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminModalBackdrop>
  );
};

export default ProductDetailModal;
