import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme/theme";
import ExpenseTrackerDashboard from "@/components/ExpenseTrackerDashboard";

/**
 * Main App Component
 * Wraps the entire app with the custom theme.
 */
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <ExpenseTrackerDashboard />
    </ThemeProvider>
  );
};

export default App;
