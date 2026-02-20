import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
} from "@mui/icons-material";
import {
  fetchAllTransactionsOnce,
  deleteTransactionFromFirestore,
} from "@/firebase/transactionsApi";

/**
 * ViewTransactions
 * - Loads transactions from Firestore (docSnap.id is used as id).
 * - Deletes permanently using deleteDoc(doc(db,"transactions", id)).
 * - After delete, reloads from Firestore and notifies dashboard via onDeleted.
 */

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

const ViewTransactions = ({ onBack, onDeleted }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnack = (message, severity) =>
    setSnackbar({ open: true, message, severity });

  const closeSnack = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((p) => ({ ...p, open: false }));
  };

  const reload = async () => {
    const data = await fetchAllTransactionsOnce();
    setTransactions(dedupeById(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        await reload();
      } catch (e) {
        console.error("Failed to load transactions:", e);
        showSnack("Couldn’t load transactions.", "error");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedTransactions = useMemo(() => {
    const copy = dedupeById(transactions);
    copy.sort((a, b) => dateToMillis(b.date) - dateToMillis(a.date));
    return copy;
  }, [transactions]);

  const openDelete = (id) => {
    setDeleteId(String(id)); // must be Firestore doc id string
    setDeleteDialogOpen(true);
  };

  const closeDelete = () => {
    if (deleting) return;
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);
    try {
      await deleteTransactionFromFirestore(deleteId);

      await reload();

      if (typeof onDeleted === "function") {
        onDeleted(); // dashboard will re-fetch
      }

      closeDelete();
      showSnack("Transaction deleted.", "success");
    } catch (e) {
      console.error("Delete failed:", e);
      closeDelete();
      showSnack("Delete failed. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const getTypeColor = (type) => (type === "income" ? "#10b981" : "#ef4444");
  const getTypeIcon = (type) =>
    type === "income" ? (
      <UpIcon sx={{ color: "white", fontSize: 18 }} />
    ) : (
      <DownIcon sx={{ color: "white", fontSize: 18 }} />
    );

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={56} thickness={4} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", px: 2, py: 3 }}>
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
        <Box sx={{ overflowY: "auto" }}>
          {sortedTransactions.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography sx={{ fontWeight: 700, color: "black" }}>
                No transactions yet
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 0.5, color: "rgba(0,0,0,0.7)" }}
              >
                Add your first transaction from dashboard
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

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        minWidth: 48,
                        justifyContent: "flex-end",
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => openDelete(t.id)}
                        sx={{
                          color: "black",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
                        }}
                        aria-label="delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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

      <Dialog open={deleteDialogOpen} onClose={closeDelete}>
        <DialogTitle sx={{ fontWeight: 900 }}>Delete transaction?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(0,0,0,0.75)" }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

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

export default ViewTransactions;
