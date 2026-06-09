import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

function ledgerDoc(uid: string, key: string) {
  return doc(db, "users", uid, "ledger", key);
}

export async function fsRead<T>(uid: string, key: string): Promise<T | null> {
  try {
    const snap = await getDoc(ledgerDoc(uid, key));
    return snap.exists() ? (snap.data() as T) : null;
  } catch {
    return null;
  }
}

export async function fsWrite(uid: string, key: string, data: object): Promise<void> {
  try {
    await setDoc(ledgerDoc(uid, key), data);
  } catch {}
}
