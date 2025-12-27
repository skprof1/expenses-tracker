import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme, Modal, Backdrop } from "@mui/material";
import SummaryHeader from "./SummaryHeader";
import DonutCharts from "./DonutCharts";
import FeatureIcons from "./FeatureIcons";
import AddTransaction from "@/pages/AddTransaction";
import { fetchAllTransactionsOnce } from "@/firebase/transactionsApi";
import styles from "@/styles/Dashboard.module.css";

const ExpenseTrackerDashboard = () => {
  const theme = useTheme();
  const [monthYear, setMonthYear] = useState("DECEMBER 2025");
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [allTransactions, setAllTransactions] = useState([]);
  const [currentMonthTransactions, setCurrentMonthTransactions] = useState([]);
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);

  // Get current month boundaries (1st to last day)
  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { firstDay, lastDay };
  };

  // Load all transactions once on mount, filter for current month
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const transactions = await fetchAllTransactionsOnce();
        setAllTransactions(transactions);

        // Filter for current month only
        const { firstDay, lastDay } = getCurrentMonthRange();
        const monthTransactions = transactions.filter((t) => {
          const transDate = new Date(t.date);
          return transDate >= firstDay && transDate <= lastDay;
        });
        setCurrentMonthTransactions(monthTransactions);

        console.log(
          `Loaded ${transactions.length} total, ${monthTransactions.length} for ${monthYear}`
        );
      } catch (error) {
        console.error("Failed to load transactions:", error);
      }
    };

    loadTransactions();
  }, []);

  // Update month display
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
  }, []);

  // Recalculate totals from current month transactions
  useEffect(() => {
    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    setIncome(totalIncome);
    setExpense(totalExpense);
    setBalance(totalIncome - totalExpense);
  }, [currentMonthTransactions]);

  // Handle new transaction from modal (add to allTransactions + refilter)
  const handleAddTransaction = (newTransaction) => {
    console.log("New transaction added:", newTransaction);

    // Add to full list
    const updatedAllTransactions = [...allTransactions, newTransaction];
    setAllTransactions(updatedAllTransactions);

    // Check if it's current month (refilter automatically updates totals)
    const { firstDay, lastDay } = getCurrentMonthRange();
    const transDate = new Date(newTransaction.date);
    if (transDate >= firstDay && transDate <= lastDay) {
      const updatedMonthTransactions = [
        ...currentMonthTransactions,
        newTransaction,
      ];
      setCurrentMonthTransactions(updatedMonthTransactions);
    }

    // Close modal after success
    setTimeout(() => {
      setAddTransactionOpen(false);
    }, 1200);
  };

  return (
    <Box className={styles.dashboardFullWidth}>
      <Typography variant="h3" className={styles.monthTitle}>
        {monthYear}
      </Typography>
      <SummaryHeader balance={balance} income={income} expense={expense} />
      <DonutCharts
        balance={balance}
        expense={expense}
        incomeTransactions={currentMonthTransactions.filter(
          (t) => t.type === "income"
        )}
        expenseTransactions={currentMonthTransactions.filter(
          (t) => t.type === "expense"
        )}
      />
      <FeatureIcons onAddTransaction={() => setAddTransactionOpen(true)} />

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
