import { useEffect, useState, type ReactNode } from "react";
import { auth } from "../../config/firebase";
import { AuthContext } from "./AuthContext";
import type { User, AuthContextData } from "../../types/firebase-types";
import { updateUserInAuth } from "./auth-utils";
import { updateUserInDB } from "../firestore/firestore-utils";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function signup(email: string, password: string) {
    const userCredential = await auth.createUserWithEmailAndPassword(
      email,
      password,
    );
    if (userCredential.user) {
      setCurrentUser(userCredential.user);
      await updateUserInDB(userCredential.user, {
        email,
      });
    }
    return userCredential;
  }

  async function login(email: string, password: string) {
    const userCredential = await auth.signInWithEmailAndPassword(
      email,
      password,
    );
    if (userCredential.user) {
      setCurrentUser(userCredential.user);
    }
    return userCredential;
  }

  async function logout() {
    await auth.signOut();
    setCurrentUser(null);
  }

  async function resetPassword(email: string) {
    await auth.sendPasswordResetEmail(email);
  }

  async function updateProfileInAuth(data: {
    email?: string;
    displayName?: string;
  }) {
    await updateUserInAuth(currentUser, data);
    await updateUserInDB(currentUser, data);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const contextData: AuthContextData = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateProfileInAuth,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
