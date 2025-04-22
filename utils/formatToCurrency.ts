/**
 * Formats a number to USD currency format
 * @param value - Number to format
 * @param minimumFractionDigits - Minimum fraction digits (default: 0)
 * @returns Formatted currency string
 */
export const formatToCurrency = (
  value: number | string,
  minimumFractionDigits: number = 0
): string => {
  if (value === undefined || value === null) {
    return "$0";
  }

  // Convert to number if it's a string
  const numValue = typeof value === "string" ? parseFloat(value) : value;

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return "$0";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits,
  }).format(numValue);
};
