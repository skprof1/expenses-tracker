import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import {
  Add as AddIcon,
  List as ListIcon,
  Search as SearchIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";

/**
 * FeatureIcons
 * Dashboard quick actions.
 * - Add/View/Filter are enabled.
 * - "Set Category Limit" stays disabled until implemented.
 */
const FeatureIcons = ({
  onAddTransaction,
  onViewTransactions,
  onFilterTransactions,
}) => {
  const actions = [
    {
      key: "add",
      icon: AddIcon,
      label: "Add Transaction",
      onClick: onAddTransaction,
      enabled: true,
    },
    {
      key: "view",
      icon: ListIcon,
      label: "View Transactions",
      onClick: onViewTransactions,
      enabled: true,
    },
    {
      key: "filter",
      icon: SearchIcon,
      label: "Filter Transactions",
      onClick: onFilterTransactions,
      enabled: true,
    },
    {
      key: "limit",
      icon: TuneIcon,
      label: "Set Category Limit",
      onClick: undefined,
      enabled: false,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 4,
        mb: 6,
        px: 2,
        flexWrap: "wrap",
      }}
    >
      {actions.map((action) => {
        const Icon = action.icon;
        const disabled = !action.enabled;

        return (
          <Box
            key={action.key}
            sx={{
              textAlign: "center",
              minWidth: 140,
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <IconButton
              aria-label={action.label}
              onClick={action.onClick}
              disabled={disabled}
              sx={{
                width: 72,
                height: 72,
                bgcolor: "white",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                borderRadius: "18px",
                "&:hover": disabled
                  ? {}
                  : {
                      bgcolor: "primary.main",
                      color: "white",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                      transform: "scale(1.05)",
                    },
                transition: "all 0.2s ease",
              }}
              size="large"
            >
              <Icon sx={{ fontSize: 28 }} />
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
        );
      })}
    </Box>
  );
};

export default FeatureIcons;
