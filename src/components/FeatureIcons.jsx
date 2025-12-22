import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import {
  Add as AddIcon,
  List as ListIcon,
  Search as SearchIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";

const FeatureIcons = () => {
  const actions = [
    { icon: AddIcon, label: "Add Transaction" }, // My priority #1 🚀
    { icon: ListIcon, label: "View Transactions" },
    { icon: SearchIcon, label: "Filter Transactions" },
    { icon: TuneIcon, label: "Set Category Limit" },
  ];

  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", gap: 4, mb: 6, px: 2 }}
    >
      {actions.map((action, index) => (
        <Box key={index} sx={{ textAlign: "center", minWidth: 140 }}>
          <IconButton
            sx={{
              width: 72,
              height: 72,
              bgcolor: "white",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              borderRadius: "18px",
              "&:hover": {
                bgcolor: "primary.main",
                color: "white",
                boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
              },
            }}
            size="large"
          >
            <action.icon sx={{ fontSize: 28 }} />
          </IconButton>
          <Typography
            variant="body2"
            sx={{
              mt: 1.6,
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "text.primary",
            }}
          >
            {action.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default FeatureIcons;
