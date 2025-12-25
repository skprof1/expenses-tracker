// Color palettes split by income/expense.

export const incomeColors = [
  "#3B82F6",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#F97316",
  "#14B8A6",
  "#84CC16",
  "#EC4899",
];

export const expenseColors = [
  "#B91C1C",
  "#DC2626",
  "#B45309",
  "#EA580C",
  "#BE123C",
  "#7C2D12",
  "#1E40AF",
  "#3730A3",
  "#581C87",
  "#991B1B",
  "#047857",
];

// Default income buckets
export const incomeCategories = [
  { type: "Business", amount: 0, color: incomeColors[0] },
  { type: "Investments", amount: 0, color: incomeColors[1] },
  { type: "Bonus", amount: 0, color: incomeColors[2] },
  { type: "Deposits", amount: 0, color: incomeColors[3] },
  { type: "Lottery", amount: 0, color: incomeColors[4] },
  { type: "Gifts", amount: 0, color: incomeColors[5] },
  { type: "Salary", amount: 0, color: incomeColors[6] },
  { type: "Savings", amount: 0, color: incomeColors[7] },
  { type: "Rental income", amount: 0, color: incomeColors[8] },
  { type: "Freelance", amount: 0, color: incomeColors[9] },
];

// Default expense buckets.
export const expenseCategories = [
  { type: "Bills", amount: 0, color: expenseColors[0] },
  { type: "Car", amount: 0, color: expenseColors[1] },
  { type: "Clothes", amount: 0, color: expenseColors[2] },
  { type: "Travel", amount: 0, color: expenseColors[3] },
  { type: "Groceries", amount: 0, color: expenseColors[4] },
  { type: "Shopping", amount: 0, color: expenseColors[5] },
  { type: "House", amount: 0, color: expenseColors[6] },
  { type: "Entertainment", amount: 0, color: expenseColors[7] },
  { type: "Phone", amount: 0, color: expenseColors[8] },
  { type: "Pets", amount: 0, color: expenseColors[9] },
  { type: "Transport", amount: 0, color: expenseColors[10] },
  { type: "Other", amount: 0, color: expenseColors[11] },
];
