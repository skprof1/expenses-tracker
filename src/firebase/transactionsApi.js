import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./config";

const TRANSACTIONS_COLLECTION = "transactions";

/**
 * Add transaction to Firestore.
 * - Firestore will generate the document id (docRef.id).
 * - We store `date` as Firestore Timestamp so queries can orderBy("date","desc").
 * - `createdAt` is stored for audit/debugging.
 *
 * Note: Do not store a local numeric `id` (Date.now). Always use Firestore doc id.
 */
export const addTransactionToFirestore = async (transaction) => {
  if (!transaction)
    throw new Error("addTransactionToFirestore: missing payload");

  // If UI passes an `id`, remove it. Firestore doc id is separate from fields.
  // eslint-disable-next-line no-unused-vars
  const { id, ...rest } = transaction;

  const payload = {
    ...rest,
    amount: Number(rest.amount) || 0,
    // UI provides yyyy-mm-dd string; convert to Date -> Timestamp
    date: Timestamp.fromDate(new Date(rest.date)),
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), payload);
  return docRef.id;
};

/**
 * Delete transaction permanently from Firestore by document id.
 */
export const deleteTransactionFromFirestore = async (id) => {
  if (!id) throw new Error("deleteTransactionFromFirestore: missing id");
  await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, String(id)));
};

/**
 * Fetch all transactions (newest transaction date first).
 * - Uses orderBy("date","desc") (date is stored as Timestamp).
 * - Normalizes `date` for UI as "yyyy-mm-dd".
 */
export const fetchAllTransactionsOnce = async () => {
  const q = query(
    collection(db, TRANSACTIONS_COLLECTION),
    orderBy("date", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    const ts = data?.date;

    return {
      id: docSnap.id,
      ...data,
      date:
        ts && typeof ts.toDate === "function"
          ? ts.toDate().toISOString().split("T")[0]
          : data.date,
    };
  });
};
