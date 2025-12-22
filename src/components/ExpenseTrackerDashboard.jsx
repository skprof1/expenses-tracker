import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import SummaryHeader from "./SummaryHeader";
import DonutCharts from "./DonutCharts";
import FeatureIcons from "./FeatureIcons";
import styles from "@/styles/Dashboard.module.css";

const ExpenseTrackerDashboard = () => {
  const theme = useTheme();
  const [monthYear, setMonthYear] = useState("DECEMBER 2025");
  const [balance, setBalance] = useState(5000);
  const [income, setIncome] = useState(8000);
  const [expense, setExpense] = useState(3000);

  // Quick check if month detection works
  useEffect(() => {
    const now = new Date();
    const monthNames = [
      "JANUARY",
      "FEBRUARY",
      "MARCH",
      "APRIL",
      "MAY",
      "JUNE",
      "JULY",
      "AUGUST",
      "SEPTEMBER",
      "OCTOBER",
      "NOVEMBER",
      "DECEMBER",
    ];
    const currentMonth = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
    setMonthYear(currentMonth);
    console.log(`Dashboard loaded for ${currentMonth}`); // debug month detection
  }, []);

  // TODO: replace with real Firestore data fetch
  // useEffect(() => {
  //   fetchUserData().then(data => {
  //     setBalance(data.balance);
  //     setIncome(data.income);
  //     setExpense(data.expense);
  //   });
  // }, []);

  return (
    <Box className={styles.dashboardFullWidth}>
      <Typography variant="h3" className={styles.monthTitle}>
        {monthYear}
      </Typography>
      <SummaryHeader balance={balance} income={income} expense={expense} />
      <DonutCharts balance={balance} expense={expense} />
      <FeatureIcons />
    </Box>
  );
};

export default ExpenseTrackerDashboard;
