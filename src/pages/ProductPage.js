import React, { useState } from "react";

const ProductPage = ({ categories, selectedCategoryIndex, onAddProduct }) => {
  const [newProd, setNewProd] = useState({ name: "", description: "", price: "" });
  const [imageData, setImageData] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setImageData(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newProd.name.trim() || !newProd.price) return;

    let imageUrl = null;
    setUploadError("");

    try {
      if (imageData) {
        setIsUploading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/home/upload-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData }),
        });

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

    onAddProduct(selectedCategoryIndex, {
      name: newProd.name.trim(),
      description: newProd.description.trim(),
      price: newProd.price,
      imageUrl,
    });

    setNewProd({ name: "", description: "", price: "" });
    setImageData(null);
  };

  const hasCategories =
    categories &&
    categories.length > 0 &&
    selectedCategoryIndex != null &&
    categories[selectedCategoryIndex];

  return (
    <div>
      <h1 style={{ marginBottom: "16px" }}>Products</h1>

      {!hasCategories && <p style={{ color: "#6b7280" }}>Create a category first before adding products.</p>}

      {hasCategories && (
        <>
          <form
            onSubmit={handleSubmit}
            style={{
              marginBottom: "20px",
              display: "grid",
              gridTemplateColumns: "3fr 3fr 2fr auto",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <input
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
              placeholder="Product name"
              value={newProd.name}
              onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
            />
            <input
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
              placeholder="Description"
              value={newProd.description}
              onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
            />
            <input
              type="number"
              style={{ padding: "8px", borderRadius: "6px", border: "1px solid #d1d5db" }}
              placeholder="Price"
              value={newProd.price}
              onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {uploadError && (
              <span style={{ color: "#dc2626", fontSize: "0.85rem" }}>
                {uploadError}
              </span>
            )}
            <button
              type="submit"
              style={{
                padding: "8px 14px",
                backgroundColor: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: "6px",
                opacity: isUploading ? 0.7 : 1,
              }}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Add"}
            </button>
          </form>

          <div>
            <h2 style={{ fontSize: "1rem", marginBottom: "8px" }}>
              Products in {categories[selectedCategoryIndex]?.name}
            </h2>
            {(!categories[selectedCategoryIndex].products ||
              categories[selectedCategoryIndex].products.length === 0) && (
              <p style={{ color: "#9ca3af" }}>No products in this category yet.</p>
            )}
            {categories[selectedCategoryIndex].products &&
              categories[selectedCategoryIndex].products.map((prod, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "4px 0",
                    borderBottom: "1px dashed #e5e7eb",
                  }}
                >
                  <span>
                    <strong>{prod.name}</strong>
                    {prod.description && (
                      <span style={{ color: "#6b7280", marginLeft: "4px" }}>
                        - {prod.description}
                      </span>
                    )}
                  </span>
                  <span>${prod.price}</span>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductPage;
