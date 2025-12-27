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

// Load all transactions once
export const fetchAllTransactionsOnce = async () => {
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      ...data,
      // Normalise date back to string for UI convenience
      date:
        data.date instanceof Timestamp
          ? data.date.toDate().toISOString().split("T")[0]
          : data.date,
    };
  });
};
