import React, { useState } from "react";
import {
  Box,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Snackbar,
  Alert,
  Container,
  Card,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { incomeCategories, expenseCategories } from "@/data/categories";
import { addTransactionToFirestore } from "@/firebase/transactionsApi";

/**
 * AddTransaction
 * - No local numeric ids.
 * - Uses native date input (single calendar icon from browser).
 * - After success, dashboard re-fetches from Firestore.
 */
const AddTransaction = ({ onBack, onCreate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [type, setType] = useState("income");
  const [category, setCategory] = useState("Salary");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // yyyy-mm-dd
  const [note, setNote] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const categories = type === "income" ? incomeCategories : expenseCategories;

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount);

    if (!amount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setSnackbar({
        open: true,
        message: "Please enter a valid amount.",
        severity: "error",
      });
      return;
    }

    if (!category) {
      setSnackbar({
        open: true,
        message: "Please choose a category.",
        severity: "error",
      });
      return;
    }

    const payload = {
      type,
      category,
      amount: numericAmount,
      date,
      note: note.trim(),
    };

    try {
      await addTransactionToFirestore(payload);

      setAmount("");
      setNote("");

      setSnackbar({
        open: true,
        message: "Transaction created",
        severity: "success",
      });

      if (typeof onCreate === "function") {
        onCreate();
      }
    } catch (err) {
      console.error("Error saving transaction:", err);
      setSnackbar({
        open: true,
        message: "Something went wrong while saving. Please try again.",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, minHeight: "100vh" }}>
      {/* Back only */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          onClick={onBack}
          sx={{
            bgcolor: "rgba(255,255,255,0.9)",
            color: "text.primary",
            "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
          }}
          aria-label="back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }} />
      </Box>

      <Card
        sx={{
          p: isMobile ? 3 : 4,
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          bgcolor: "background.paper",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ display: "grid", gap: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={type}
                label="Type"
                onChange={(e) => {
                  const nextType = e.target.value;
                  const nextCategories =
                    nextType === "income"
                      ? incomeCategories
                      : expenseCategories;
                  setType(nextType);
                  setCategory(nextCategories[0]?.type || "");
                }}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ borderRadius: "16px" }}
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ borderRadius: "16px" }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.type} value={cat.type}>
                    {cat.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              slotProps={{ input: { step: "0.01" } }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
              size="small"
            />

            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              // Native date input already has a calendar icon -> do not add another
              slotProps={{
                inputLabel: { shrink: true },
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
              size="small"
            />
          </Box>

          <TextField
            label="Note (optional)"
            multiline
            minRows={2}
            maxRows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
            size="small"
          />

          <Button
            onClick={handleSubmit}
            variant="contained"
            fullWidth
            size="large"
            sx={{
              py: 2,
              borderRadius: "20px",
              fontSize: "1.05rem",
              fontWeight: 700,
              bgcolor: "primary.main",
              boxShadow: "0 10px 30px rgba(59,130,246,0.4)",
              "&:hover": {
                bgcolor: "primary.dark",
                boxShadow: "0 15px 40px rgba(59,130,246,0.5)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.25s ease",
            }}
          >
            Create Transaction
          </Button>
        </Box>
      </Card>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%", borderRadius: "12px" }}
          elevation={6}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddTransaction;
