import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Modal, Backdrop } from "@mui/material";
import SummaryHeader from "./SummaryHeader";
import DonutCharts from "./DonutCharts";
import FeatureIcons from "./FeatureIcons";
import AddTransaction from "@/pages/AddTransaction";
import ViewTransactions from "@/pages/ViewTransactions";
import FilterTransactions from "@/pages/FilterTransactions";
import { fetchAllTransactionsOnce } from "@/firebase/transactionsApi";
import styles from "@/styles/Dashboard.module.css";

/**
 * ExpenseTrackerDashboard
 * Main screen of the app.
 *
 * Data rules:
 * - (we re-fetch after mutations instead of appending locally).
 *
 * UI rules:
 * - All actions open as centered MUI Modals with a blurred/dimmed backdrop.
 * - Add/View/Filter share the same modal styling via `commonModalProps`.
 *
 * Notes:
 * - DonutCharts and SummaryHeader are derived from current-month transactions only.
 */
const ExpenseTrackerDashboard = () => {
  const [monthYear, setMonthYear] = useState("");
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);

  const [allTransactions, setAllTransactions] = useState([]);

  // Modal states
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [viewTransactionsOpen, setViewTransactionsOpen] = useState(false);
  const [filterTransactionsOpen, setFilterTransactionsOpen] = useState(false);

  /**
   * Current month boundaries (local time).
   * - firstDay: start of month
   * - lastDay: end of month (inclusive)
   */
  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);
    return { firstDay, lastDay };
  };

  /**
   * Month label
   * Kept as state to avoid recomputing every render.
   */
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

  /**
   * Single fetch function for the dashboard.
   * We always replace state from Firestore (no local append), so ids stay correct.
   */
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

  /**
   * Current month transactions are derived from allTransactions.
   * This keeps the totals/charts consistent with Firestore and avoids duplicate state.
   */
  const currentMonthTransactions = useMemo(() => {
    const { firstDay, lastDay } = getCurrentMonthRange();
    return (allTransactions || []).filter((t) => {
      const d = new Date(t.date);
      return d >= firstDay && d <= lastDay;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTransactions]);

  // Totals derived from current month transactions
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
   * Called after a successful create.
   * We re-fetch and then close the modal (small delay for a smooth UX).
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
   * Called after a successful delete from ViewTransactions.
   * Keeps dashboard totals/charts consistent.
   */
  const handleDeleted = async () => {
    try {
      await refreshFromFirestore();
    } catch (e) {
      console.error("Refresh after delete failed:", e);
    }
  };

  /**
   * Shared modal styling (latest MUI slots + slotProps).
   * This avoids deprecated BackdropProps/BackdropComponent usage.
   */
  const commonModalProps = {
    slots: { backdrop: Backdrop },
    slotProps: {
      backdrop: {
        timeout: 300,
        sx: {
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0,0,0,0.6)",
        },
      },
    },
    sx: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      p: 2,
    },
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
        onFilterTransactions={() => setFilterTransactionsOpen(true)}
      />

      <Modal
        open={addTransactionOpen}
        onClose={() => setAddTransactionOpen(false)}
        {...commonModalProps}
      >
        <AddTransaction
          onBack={() => setAddTransactionOpen(false)}
          onCreate={handleCreated}
        />
      </Modal>

      <Modal
        open={viewTransactionsOpen}
        onClose={() => setViewTransactionsOpen(false)}
        {...commonModalProps}
      >
        <ViewTransactions
          onBack={() => setViewTransactionsOpen(false)}
          onDeleted={handleDeleted}
        />
      </Modal>

      <Modal
        open={filterTransactionsOpen}
        onClose={() => setFilterTransactionsOpen(false)}
        {...commonModalProps}
      >
        <FilterTransactions onBack={() => setFilterTransactionsOpen(false)} />
      </Modal>
    </Box>
  );
};

export default ExpenseTrackerDashboard;
