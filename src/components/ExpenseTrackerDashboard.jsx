import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, Modal, Backdrop } from "@mui/material";
import SummaryHeader from "./SummaryHeader";
import DonutCharts from "./DonutCharts";
import FeatureIcons from "./FeatureIcons";
import AddTransaction from "@/pages/AddTransaction";
import styles from "@/styles/Dashboard.module.css";

const ExpenseTrackerDashboard = () => {
  const theme = useTheme();
  const [monthYear, setMonthYear] = useState("DECEMBER 2025");
  const [balance, setBalance] = useState(5000);
  const [income, setIncome] = useState(8000);
  const [expense, setExpense] = useState(3000);

  // Modal state for Add Transaction
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);

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

  // Handle new transaction from modal
  const handleAddTransaction = (newTransaction) => {
    console.log("New transaction:", newTransaction); // debug log
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);

    // Recalculate totals (will connect to Firebase later)
    const totalIncome = updatedTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = updatedTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    setIncome(totalIncome);
    setExpense(totalExpense);
    setBalance(totalIncome - totalExpense);

    // Close modal after success
    setTimeout(() => {
      setAddTransactionOpen(false);
    }, 1200); // 1.2s delay = smooth UX
  };

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
      <FeatureIcons onAddTransaction={() => setAddTransactionOpen(true)} />

      {/* Add Transaction Modal */}
      <Modal
        open={addTransactionOpen}
        onClose={() => setAddTransactionOpen(false)}
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
            sx: {
              backdropFilter: "blur(4px)",
              backgroundColor: "rgba(0,0,0,0.6)",
            },
          },
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <AddTransaction
          onBack={() => setAddTransactionOpen(false)}
          onCreate={handleAddTransaction}
        />
      </Modal>
    </Box>
  );
};

export default ExpenseTrackerDashboard;
