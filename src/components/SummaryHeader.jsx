import React from "react";
import { Card, Typography, Box } from "@mui/material";
import {
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  AccountBalanceWallet as BalanceIcon,
} from "@mui/icons-material";

const SummaryHeader = ({ balance, income, expense }) => {
  const summaryStats = [
    { label: "Income", value: income, icon: ArrowUpIcon, color: "#10b981" },
    { label: "Expense", value: expense, icon: ArrowDownIcon, color: "#ef4444" },
    { label: "Balance", value: balance, icon: BalanceIcon, color: "#10b981" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        maxWidth: 1000,
        mx: "auto",
        mb: 4,
        px: 3,
        gap: 2.5,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {summaryStats.map((item, index) => (
        <Card
          key={index}
          sx={{
            flex: "1 1 280px",
            height: 96,
            borderRadius: "24px",
            p: 3.2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                bgcolor: item.color + "30",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <item.icon sx={{ fontSize: 28, color: item.color }} />
            </Box>
          </Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: "1.1rem",
              mb: 0.8,
              color: "text.secondary",
            }}
          >
            {item.label}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: "2rem",
              color: "text.primary",
              lineHeight: 1.1,
            }}
          >
            ${item.value.toLocaleString()}
          </Typography>
          {/* hmm, balance icon same color as income -- maybe fix later */}
        </Card>
      ))}
    </Box>
  );
};

export default SummaryHeader;
