/**
 * Returns shortcut texts for segmented controls based on the given context
 * @param context - The context identifier for which shortcut texts are needed
 * @returns Array of shortcut text strings
 */
export const getSegmentedControlShortcutTexts = (context: string): string[] => {
  switch (context) {
    case "timeframe":
      return ["W", "M", "Y"]; // Weekly, Monthly, Yearly
    case "chartType":
      return ["Bar", "Line"];
    case "transactionType":
      return ["All", "Inc", "Exp"]; // All, Income, Expense
    default:
      return [];
  }
};
