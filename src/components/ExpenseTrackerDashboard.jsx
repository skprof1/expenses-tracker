import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Modal, Backdrop } from "@mui/material";
import SummaryHeader from "./SummaryHeader";
import DonutCharts from "./DonutCharts";
import FeatureIcons from "./FeatureIcons";
import AddTransaction from "@/pages/AddTransaction";
import ViewTransactions from "@/pages/ViewTransactions";
import { fetchAllTransactionsOnce } from "@/firebase/transactionsApi";
import styles from "@/styles/Dashboard.module.css";

/**
 * ExpenseTrackerDashboard
 
 * - After add/delete, we re-fetch from Firestore to avoid id mismatches and stale UI.
 */
const ExpenseTrackerDashboard = () => {
  const [monthYear, setMonthYear] = useState("");
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  const [allTransactions, setAllTransactions] = useState([]);
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [viewTransactionsOpen, setViewTransactionsOpen] = useState(false);

  // Current month boundaries (1st day 00:00:00 to last day 23:59:59)
  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { firstDay, lastDay };
  };

  // Build "MONTH YYYY" label
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
    setMonthYear(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);
  }, []);

  // Load from Firestore (single place)
  const refreshFromFirestore = async () => {
    const tx = await fetchAllTransactionsOnce();
    setAllTransactions(Array.isArray(tx) ? tx : []);
  };

  // Initial load
  useEffect(() => {
    (async () => {
      try {
        await refreshFromFirestore();
      } catch (e) {
        console.error("Failed to load transactions:", e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only current month transactions (derived, not separately stored)
  const currentMonthTransactions = useMemo(() => {
    const { firstDay, lastDay } = getCurrentMonthRange();
    return (allTransactions || []).filter((t) => {
      const d = new Date(t.date);
      return d >= firstDay && d <= lastDay;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTransactions]);

  // Totals derived from current month
  useEffect(() => {
    const totalIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalExpense = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    setIncome(totalIncome);
    setExpense(totalExpense);
    setBalance(totalIncome - totalExpense);
  }, [currentMonthTransactions]);

  /**
   * Called by AddTransaction after Firestore add succeeds.
   * We re-fetch instead of appending local objects (prevents numeric-id bugs).
   */
  const handleCreated = async () => {
    try {
      await refreshFromFirestore();
      setTimeout(() => setAddTransactionOpen(false), 400);
    } catch (e) {
      console.error("Refresh after create failed:", e);
    }
  };

  /**
   * Called by ViewTransactions after Firestore delete succeeds.
   * Keeps dashboard charts/totals in sync.
   */
  const handleDeleted = async () => {
    try {
      await refreshFromFirestore();
    } catch (e) {
      console.error("Refresh after delete failed:", e);
    }
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
          (t) => t.type === "income",
        )}
        expenseTransactions={currentMonthTransactions.filter(
          (t) => t.type === "expense",
        )}
      />

      <FeatureIcons
        onAddTransaction={() => setAddTransactionOpen(true)}
        onViewTransactions={() => setViewTransactionsOpen(true)}
      />

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
          onCreate={handleCreated}
        />
      </Modal>

      <Modal
        open={viewTransactionsOpen}
        onClose={() => setViewTransactionsOpen(false)}
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
        <ViewTransactions
          onBack={() => setViewTransactionsOpen(false)}
          onDeleted={handleDeleted}
        />
      </Modal>
    </Box>
  );
};

export default ExpenseTrackerDashboard;
