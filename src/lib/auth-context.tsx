import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, db } from "./db";

interface AuthContextType {
  user: User | null;
  role: "admin" | "guard" | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (user: User) => void;
  setMockUser: (mockRole: "admin" | "guard") => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  signIn: () => {},
  setMockUser: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "guard" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
      const savedUser = db.getUserById(savedUserId);
      if (savedUser) {
        setUser(savedUser);
        setRole(savedUser.role);
      }
    }
    setLoading(false);
  }, []);

  const signIn = (authData: User) => {
    localStorage.setItem('currentUserId', authData.uid);
    setUser(authData);
    setRole(authData.role);
  };

  const signOut = async () => {
    localStorage.removeItem('currentUserId');
    setUser(null);
    setRole(null);
  };

  const setMockUser = (mockRole: "admin" | "guard") => {
    const defaultUser: User = { uid: "mock_user", email: `preview-${mockRole}@example.com`, displayName: 'Guest User', role: mockRole };
    signIn(defaultUser);
    db.saveUser(defaultUser);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut, signIn, setMockUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

