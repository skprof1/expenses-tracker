import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  List,
  ListItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
} from "@mui/icons-material";
import { fetchMonthTransactionsOnce } from "@/firebase/transactionsApi";

/**
 * FilterTransactions (Modal Page)
 * - Matches ViewTransactions look & feel (same card, same list rows).
 * - Fetches the selected month from Firestore once, then filters type locally.
 *   This avoids composite-index errors for users and makes Type switching instant.
 * - Shows loading only when Year/Month changes (network fetch).
 * - Totals are computed client-side from the currently visible list.
 */

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dedupeById = (arr) => {
  const map = new Map();
  for (const t of arr || []) {
    if (!t?.id) continue;
    map.set(String(t.id), { ...t, id: String(t.id) });
  }
  return Array.from(map.values());
};

const dateToMillis = (d) => {
  if (!d) return 0;
  if (typeof d?.toDate === "function") return d.toDate().getTime();
  if (d instanceof Date) return d.getTime();
  if (typeof d === "string") return new Date(d).getTime();
  return 0;
};

const FilterTransactions = ({ onBack }) => {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth()); // 0-11
  const [type, setType] = useState("all"); // all | income | expense

  // Source data for the selected month (fetched once per Year/Month)
  const [monthTransactions, setMonthTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const requestSeq = useRef(0);
  const debounceRef = useRef(null);

  const showSnack = (message, severity) =>
    setSnackbar({ open: true, message, severity });

  const closeSnack = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((p) => ({ ...p, open: false }));
  };

  const years = useMemo(() => {
    const current = now.getFullYear();
    const out = [];
    for (let y = current; y >= 2000; y--) out.push(y);
    return out;
  }, [now]);

  /**
   * Fetch only Year/Month from Firestore.
   * - Debounced for smoother UX when a user scrolls/selects quickly.
   * - Guarded to avoid stale responses overwriting the latest selection.
   */
  const reloadMonth = async ({ nextYear, nextMonthIndex }) => {
    const seq = ++requestSeq.current;
    setLoading(true);

    try {
      const data = await fetchMonthTransactionsOnce({
        year: nextYear,
        monthIndex: nextMonthIndex,
      });

      if (seq !== requestSeq.current) return;

      setMonthTransactions(dedupeById(Array.isArray(data) ? data : []));
    } catch (e) {
      console.error("Month load failed:", e);
      if (seq !== requestSeq.current) return;

      // Real network errors only. Type filtering is local, so no index errors here.
      showSnack("Couldn’t load transactions for this month.", "error");
      setMonthTransactions([]);
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  };

  // Fetch when Year/Month changes (Type changes do not trigger network calls)
  useEffect(() => {
    const next = { nextYear: year, nextMonthIndex: monthIndex };

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      reloadMonth(next);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, monthIndex]);

  /**
   * Visible list is derived locally:
   * - Type switching is instant (no loading spinner, no Firestore query).
   */
  const visibleTransactions = useMemo(() => {
    if (type === "income")
      return monthTransactions.filter((t) => t.type === "income");
    if (type === "expense")
      return monthTransactions.filter((t) => t.type === "expense");
    return monthTransactions;
  }, [monthTransactions, type]);

  const sortedTransactions = useMemo(() => {
    const copy = dedupeById(visibleTransactions);
    copy.sort((a, b) => dateToMillis(b.date) - dateToMillis(a.date));
    return copy;
  }, [visibleTransactions]);

  const totals = useMemo(() => {
    const totalIncome = sortedTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalExpense = sortedTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
    };
  }, [sortedTransactions]);

  const getTypeColor = (txType) =>
    txType === "income" ? "#10b981" : "#ef4444";
  const getTypeIcon = (txType) =>
    txType === "income" ? (
      <UpIcon sx={{ color: "white", fontSize: 18 }} />
    ) : (
      <DownIcon sx={{ color: "white", fontSize: 18 }} />
    );

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
      {/* Back button row (matches ViewTransactions) */}
      <Box sx={{ maxWidth: 680, mx: "auto", mb: 2 }}>
        <IconButton
          onClick={onBack}
          sx={{
            mr: 2,
            bgcolor: "rgba(255,255,255,0.9)",
            color: "text.primary",
            "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
          }}
          aria-label="back"
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Card
        sx={{
          maxWidth: 680,
          mx: "auto",
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          bgcolor: "background.paper",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
          maxHeight: "78vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Filters + totals (non-scroll area) */}
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 2,
            }}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select
                value={year}
                label="Year"
                onChange={(e) => setYear(Number(e.target.value))}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ borderRadius: "16px" }}
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select
                value={monthIndex}
                label="Month"
                onChange={(e) => setMonthIndex(Number(e.target.value))}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ borderRadius: "16px" }}
              >
                {monthNames.map((m, idx) => (
                  <MenuItem key={m} value={idx}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                label="Type"
                onChange={(e) => setType(String(e.target.value))}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ borderRadius: "16px" }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Totals row (based on visible list) */}
          <Box
            sx={{
              mt: 2.25,
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Typography sx={{ fontWeight: 900, color: "#10b981" }}>
              Income: ₹{totals.income.toLocaleString()}
            </Typography>
            <Typography sx={{ fontWeight: 900, color: "#ef4444" }}>
              Expense: ₹{totals.expense.toLocaleString()}
            </Typography>
            <Typography sx={{ fontWeight: 900, color: "black", opacity: 0.85 }}>
              Net: ₹{totals.net.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Divider */}
        <Box
          sx={{
            height: "1px",
            mx: 3,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.14), rgba(0,0,0,0))",
          }}
        />

        {/* Scroll list area */}
        <Box sx={{ overflowY: "auto" }}>
          {loading ? (
            <Box
              sx={{
                minHeight: "46vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
              }}
            >
              <CircularProgress size={48} thickness={4} />
            </Box>
          ) : sortedTransactions.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography sx={{ fontWeight: 700, color: "black" }}>
                No transactions for this filter
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 0.5, color: "rgba(0,0,0,0.7)" }}
              >
                Try changing month, year or type
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {sortedTransactions.map((t, idx) => (
                <React.Fragment key={t.id}>
                  <ListItem disableGutters sx={{ px: 3, py: 1.6 }}>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        flex: 1,
                        minWidth: 0,
                        alignItems: "flex-start",
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: getTypeColor(t.type),
                          boxShadow: "0 4px 12px rgba(0,0,0,0.16)",
                          flex: "0 0 auto",
                          mt: 0.2,
                        }}
                      >
                        {getTypeIcon(t.type)}
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          sx={{
                            fontWeight: 900,
                            color: "black",
                            lineHeight: 1.2,
                            mb: 0.35,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {String(t.category || "")}
                        </Typography>

                        <Typography
                          sx={{ color: "black", fontSize: "1.02rem" }}
                        >
                          {String(t.type || "").toUpperCase()}
                        </Typography>

                        <Typography
                          sx={{ color: "black", fontSize: "1.02rem" }}
                        >
                          {t.date ? new Date(t.date).toLocaleDateString() : ""}
                        </Typography>

                        {t.note ? (
                          <Typography
                            sx={{
                              mt: 0.65,
                              color: "black",
                              fontSize: "1.02rem",
                              opacity: 0.82,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {String(t.note)}
                          </Typography>
                        ) : null}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        minWidth: 140,
                        pr: 1.25,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 900,
                          color: "black",
                          fontSize: "1.1rem",
                        }}
                      >
                        ₹{Number(t.amount || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </ListItem>

                  {idx !== sortedTransactions.length - 1 ? (
                    <Box
                      sx={{
                        height: "1px",
                        mx: 3,
                        background:
                          "linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.14), rgba(0,0,0,0))",
                      }}
                    />
                  ) : null}
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Card>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={closeSnack}
      >
        <Alert
          onClose={closeSnack}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: "12px" }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FilterTransactions;
