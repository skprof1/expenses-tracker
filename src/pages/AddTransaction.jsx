import React, { useState } from "react";
import {
  Box,
  Typography,
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
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { incomeCategories, expenseCategories } from "@/data/categories";

const AddTransaction = ({ onBack, onCreate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [type, setType] = useState("income");
  const [category, setCategory] = useState("Salary");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0] // yyyy-mm-dd
  );
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

  const handleSubmit = () => {
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

    const newTransaction = {
      id: Date.now(), // quick local id; Firestore will replace later
      type,
      category,
      amount: numericAmount,
      date,
      note: note.trim(),
      createdAt: new Date().toISOString(),
    };

    // This will be wired to context + Firebase later
    if (typeof onCreate === "function") {
      onCreate(newTransaction);
    }

    // Reset form, keep type so user can add multiple quickly
    setAmount("");
    setNote("");
    setSnackbar({
      open: true,
      message: "Transaction created 🎉",
      severity: "success",
    });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 5 }}>
        <IconButton
          onClick={onBack}
          sx={{
            mr: 2,
            bgcolor: "rgba(255,255,255,0.9)",
            color: "text.primary",
            "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          fontWeight={800}
          sx={{
            color: "text.primary",
            textAlign: "center",
            flexGrow: 1,
          }}
        >
          Add Transaction
        </Typography>
      </Box>

      {/* Form Card */}
      <Card
        sx={{
          p: 4,
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          bgcolor: "background.paper",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ display: "grid", gap: 3 }}>
          {/* Row 1: Type & Category */}
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
                  // pick first available as default
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

          {/* Row 2: Amount & Date */}
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
              slotProps={{
                input: {
                  min: "2025-11-15",
                },
                inputLabel: { shrink: true },
              }}
              InputProps={{
                endAdornment: (
                  <CalendarTodayIcon sx={{ color: "action.active", mr: 1 }} />
                ),
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
              size="small"
            />
          </Box>

          {/* Optional note */}
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

          {/* Create Button */}
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

      {/* Snackbar */}
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
