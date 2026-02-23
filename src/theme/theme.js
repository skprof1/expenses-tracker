import { createTheme } from "@mui/material/styles";

/**
 * App theme
 * - Keep palette.primary so MUI "primary" colors are consistent globally.
 * - Keep typography.fontFamily so modals/other pages don't fall back to defaults.
 */
const theme = createTheme({
  palette: {
    primary: {
      main: "#10b981",
    },
  },
  typography: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  },
});

export default theme;
