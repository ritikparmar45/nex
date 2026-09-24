/**
 * Formats a numeric price into USD currency string format ($XX.YY)
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price || 0);
};

export const formatCurrency = formatPrice;


/**
 * Truncates text to a specified maximum length with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 60): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Capitalizes category slugs (e.g., 'smartphones' -> 'Smartphones', 'mens-shirts' -> 'Mens Shirts')
 */
export const formatCategoryName = (category: string | { name: string }): string => {
  if (typeof category === 'object' && category.name) {
    return category.name;
  }
  const str = String(category);
  if (!str) return 'General';
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Extracts category slug string from Category object or string
 */
export const getCategorySlug = (category: string | { slug: string }): string => {
  if (typeof category === 'object' && category.slug) {
    return category.slug;
  }
  return String(category);
};
