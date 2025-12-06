"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserData {
  displayName: string;
  email: string;
  photoURL?: string;
  joinedAt: Date;
  favorites: string[];
  relation: string;
}

export interface FamilyMember {
  id: string;
  displayName: string;
  relation: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  login: (memberId: string, passcode: string) => Promise<void>;
  register: (params: {
    email: string;
    passcode: string;
    displayName: string;
    relation: string;
  }) => Promise<void>;
  fetchFamilyMembers: () => Promise<FamilyMember[]>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data() as Omit<UserData, "joinedAt"> & {
            joinedAt?: Date | { toDate: () => Date };
          };
          setUserData({
            ...data,
            joinedAt:
              data.joinedAt instanceof Date
                ? data.joinedAt
                : data.joinedAt && "toDate" in data.joinedAt
                ? data.joinedAt.toDate()
                : new Date(),
          });
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createUserDocument = async (
    user: User,
    displayName: string,
    relation: string
  ) => {
    const cleanRelation = relation.trim();
    const userRef = doc(db, "users", user.uid);
    const userData: UserData = {
      displayName,
      email: user.email || "",
      joinedAt: new Date(),
      favorites: [],
      relation: cleanRelation,
      ...(user.photoURL ? { photoURL: user.photoURL } : {}),
    } as UserData;

    await setDoc(userRef, userData);
    setUserData(userData);
  };

  const resolveMemberEmail = async (memberId: string) => {
    const memberDoc = await getDoc(doc(db, "users", memberId));
    if (!memberDoc.exists()) {
      throw new Error("Family member not found");
    }
    const data = memberDoc.data() as UserData;
    return data.email;
  };

  const login = async (memberId: string, passcode: string) => {
    try {
      setError(null);
      const familyPasscode = import.meta.env.VITE_FAMILY_PASSWORD;
      if (!familyPasscode) {
        throw new Error("Family password is not configured.");
      }
      if (passcode !== familyPasscode) {
        throw new Error("That is not the Lewis family password.");
      }
      const email = await resolveMemberEmail(memberId);
      await signInWithEmailAndPassword(auth, email, passcode);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please verify the family password."
      );
      throw err;
    }
  };

  const register = async ({
    email,
    passcode,
    displayName,
    relation,
  }: {
    email: string;
    passcode: string;
    displayName: string;
    relation: string;
  }) => {
    try {
      setError(null);
      const familyPasscode = import.meta.env.VITE_FAMILY_PASSWORD;

      if (!familyPasscode) {
        throw new Error("Family password is not configured.");
      }

      if (passcode !== familyPasscode) {
        throw new Error("That is not the correct family password.");
      }

      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        passcode
      );
      await updateProfile(user, { displayName });
      await createUserDocument(user, displayName, relation);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to register with the provided details."
      );
      throw err;
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const membersSnapshot = await getDocs(collection(db, "users"));
      return membersSnapshot.docs.map((snapshot) => {
        const data = snapshot.data() as UserData;
        return {
          id: snapshot.id,
          displayName: data.displayName,
          relation: data.relation,
          email: data.email,
        };
      });
    } catch (err) {
      console.error("Error fetching family members:", err);
      throw err instanceof Error
        ? err
        : new Error("Unable to load family members.");
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout");
      throw err;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        error,
        login,
        register,
        fetchFamilyMembers,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
