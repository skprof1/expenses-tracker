import React, { useState, useRef } from "react";
import { Card, Box, Typography } from "@mui/material";
import {
  incomeCategories,
  expenseCategories,
  incomeColors,
  expenseColors,
} from "@/data/categories";

const DonutCharts = ({
  balance,
  expense,
  incomeTransactions = [],
  expenseTransactions = [],
}) => {
  const [tooltip, setTooltip] = useState({
    show: false,
    x: 0,
    y: 0,
    text: "",
    activeChart: "",
  });

  const RADIUS = 105;
  const STROKE_WIDTH = 22;
  const CENTER = 150;
  const CIRC = 2 * Math.PI * RADIUS;

  // Group transactions by category and calculate totals
  const getCategoryData = (transactions, categories, colors) => {
    const categoryTotals = {};

    // Sum amounts by category from transactions
    transactions.forEach((t) => {
      const cat = t.category;
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
    });

    // Match with category definitions, assign colors, filter zero amounts
    return categories
      .map((cat, index) => ({
        name: cat.type,
        value:
          ((categoryTotals[cat.type] || 0) / Math.max(balance + expense, 1)) *
          100,
        amount: categoryTotals[cat.type] || 0,
        color: colors[index % colors.length],
      }))
      .filter((cat) => cat.amount > 0)
      .slice(0, 12); // max 12 segments (matches category count)
  };

  const incomeData = getCategoryData(
    incomeTransactions,
    incomeCategories,
    incomeColors
  );
  const expenseData = getCategoryData(
    expenseTransactions,
    expenseCategories,
    expenseColors
  );

  const DonutChart = ({
    data,
    centerText,
    centerValue,
    colorScheme,
    chartType,
  }) => {
    const svgRef = useRef(null);
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;

    const segments = data.map((item, i) => {
      const prevSum =
        i === 0 ? 0 : data.slice(0, i).reduce((s, d) => s + d.value, 0);
      const startAngle = (prevSum / total) * 360;
      const endAngle = ((prevSum + item.value) / total) * 360;
      const arcLength = (item.value / total) * CIRC;
      const dashOffset = CIRC * (startAngle / 360);

      return { ...item, startAngle, endAngle, arcLength, dashOffset };
    });
    // Tooltip detection (took a while to get angles right)
    const handleMouseMove = (e) => {
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = x - CENTER;
      const dy = y - CENTER;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (
        distance < RADIUS - STROKE_WIDTH ||
        distance > RADIUS + STROKE_WIDTH
      ) {
        setTooltip((prev) => ({ ...prev, show: false }));
        return;
      }

      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      // Fixed tooltip positioning after debugging rotation
      const visualAngle = (angle + 270) % 360;

      for (const seg of segments) {
        if (visualAngle >= seg.startAngle && visualAngle < seg.endAngle) {
          setTooltip({
            show: true,
            x: e.clientX + 15,
            y: e.clientY - 40,
            text: `${seg.name}: $${seg.amount.toLocaleString()}`,
            activeChart: chartType,
          });
          return;
        }
      }
      setTooltip((prev) => ({ ...prev, show: false }));
    };

    const handleMouseLeave = () => {
      setTooltip((prev) => ({ ...prev, show: false }));
    };

    return (
      <Box sx={{ position: "relative", mx: 1, minWidth: 320 }}>
        <Card
          sx={{
            p: 3.5,
            borderRadius: "24px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            height: 260,
            width: 320,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            bgcolor: "white",
          }}
        >
          <svg
            ref={svgRef}
            width="300"
            height="300"
            viewBox="0 0 300 300"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="white"
              stroke="none"
            />
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="butt"
                strokeDasharray={`${seg.arcLength} ${CIRC - seg.arcLength}`}
                strokeDashoffset={-(CIRC * 0.25) - seg.dashOffset}
                style={{ cursor: "pointer" }}
              />
            ))}
          </svg>

          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              width: 200,
              pointerEvents: "none",
            }}
          >
            <Typography
              variant="h6"
              fontWeight={900}
              color={colorScheme === "income" ? "success.main" : "error.main"}
              sx={{
                fontSize: "1.05rem",
                mb: 0.6,
                lineHeight: 1.2,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              {centerText}
            </Typography>
            <Typography
              variant="h3"
              fontWeight={900}
              color="text.primary"
              sx={{ fontSize: "2.2rem", lineHeight: 1 }}
            >
              ${centerValue.toLocaleString()}
            </Typography>
          </Box>
        </Card>

        {tooltip.show && tooltip.activeChart === chartType && (
          <div
            style={{
              position: "fixed",
              left: `${tooltip.x}px`,
              top: `${tooltip.y}px`,
              background: "rgba(0,0,0,0.95)",
              color: "white",
              padding: "10px 18px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 700,
              pointerEvents: "none",
              zIndex: 10000,
              minWidth: "140px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            {tooltip.text}
          </div>
        )}
      </Box>
    );
  };
  // TODO: add mobile swipe gestures for donuts
  return (
    <Box sx={{ display: "flex", justifyContent: "center", gap: 6, mb: 4 }}>
      <DonutChart
        data={incomeData}
        centerText="Safe to spend"
        centerValue={balance}
        colorScheme="income"
        chartType="income"
      />
      <DonutChart
        data={expenseData}
        centerText="Total Expense"
        centerValue={expense}
        colorScheme="expense"
        chartType="expense"
      />
    </Box>
  );
};

export default DonutCharts;
