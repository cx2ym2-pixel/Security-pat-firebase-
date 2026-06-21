import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  role: "admin" | "guard" | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setMockUser: (mockRole: "admin" | "guard") => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  setMockUser: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "guard" | null>(null);
  const [loading, setLoading] = useState(true);
  const isMocked = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // If we've already mocked a login, do not override unless user logs out
      if (isMocked.current) {
        setLoading(false);
        return;
      }
      
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role as "admin" | "guard");
          } else {
            console.warn("User document not found for UI role, defaulting to guard");
            setRole("guard");
          }
        } catch (error) {
          console.error("Failed to fetch user role", error);
          setRole("guard");
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    if (user && user.uid === "mock_user") {
      isMocked.current = false;
      setUser(null);
      setRole(null);
    } else {
      await firebaseSignOut(auth);
    }
  };

  const setMockUser = (mockRole: "admin" | "guard") => {
    isMocked.current = true;
    setUser({ uid: "mock_user", email: `preview-${mockRole}@example.com` } as User);
    setRole(mockRole);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut, setMockUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
