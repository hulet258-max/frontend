export const productsForCategory = (category) =>
  Array.isArray(category?.products) ? category.products : [];

export const visibleProductsForCategory = (category) =>
  productsForCategory(category).filter(
    (product) => product.isavailabel === undefined || product.isavailabel
  );

export const normalizeCategories = (categories) =>
  Array.isArray(categories)
    ? categories.map((category) => ({
        ...category,
        products: productsForCategory(category),
      }))
    : [];

export const normalizeMenu = (data) => ({
  ...(data || {}),
  categories: normalizeCategories(data?.categories),
});
