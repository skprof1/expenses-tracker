import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

const TRANSACTIONS_COLLECTION = "transactions";

// Save a single transaction
export const addTransactionToFirestore = async (transaction) => {
  const payload = {
    ...transaction,
    // Firestore prefers Timestamp for date fields
    date: Timestamp.fromDate(new Date(transaction.date)),
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), payload);
  return docRef.id;
};

// Fetch all transactions (we'll use this later for "View Transactions")
export const fetchAllTransactions = async () => {
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
