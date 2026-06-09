"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Consume the redirect result when returning from Google sign-in
    getRedirectResult(auth).catch(() => {});

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signIn() {
    await signInWithRedirect(auth, new GoogleAuthProvider());
  }

  async function signOut() {
    await firebaseSignOut(auth);
  }

  return { user, loading, signIn, signOut };
}
