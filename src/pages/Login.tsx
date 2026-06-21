import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ShieldAlert, Loader2, UserCog, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "react-toastify";
import { useAuth } from "../lib/auth-context";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setMockUser } = useAuth(); // We'll add this to auth-context.tsx

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      let role = "guard";
      if (userDoc.exists()) {
        role = userDoc.data().role;
      }
      toast.success("Login successful");
      navigate(role === "admin" ? "/admin" : "/guard");
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
         toast.error("Email/Password Auth is disabled in Firebase Console.");
      } else {
         toast.error(err.message || "Failed to login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: "admin" | "guard") => {
    setLoading(true);
    const demoEmail = role === "admin" ? "admin@example.com" : "guard@example.com";
    const demoPassword = "password123";
    
    try {
      await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
      toast.success(`Logged in as ${role}`);
      navigate(role === "admin" ? "/admin" : "/guard");
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        toast.info(`Auth disabled in Firebase. Using Local Mock ${role.toUpperCase()} Mode.`);
        setMockUser(role);
        navigate(role === "admin" ? "/admin" : "/guard");
      } else {
        try {
          const creds = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
          await setDoc(doc(db, "users", creds.user.uid), {
            email: demoEmail,
            role: role,
            name: role === "admin" ? "Super Admin" : "Guard 1"
          });
          toast.success(`Demo ${role} created and logged in`);
          navigate(role === "admin" ? "/admin" : "/guard");
        } catch (createErr: any) {
          if (createErr.code === 'auth/operation-not-allowed') {
            toast.info(`Auth disabled in Firebase. Using Local Mock ${role.toUpperCase()} Mode.`);
            setMockUser(role);
            navigate(role === "admin" ? "/admin" : "/guard");
          } else {
            toast.error(createErr.message || "Failed to create demo account");
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Let's assume a new Google user is an admin for demo purposes, or we can look it up
      const userDoc = await getDoc(doc(db, "users", result.user.uid));
      let role = "admin"; // Default Google sign in to admin for easy access
      if (userDoc.exists()) {
        role = userDoc.data().role;
      } else {
         await setDoc(doc(db, "users", result.user.uid), {
            email: result.user.email,
            role: "admin",
            name: result.user.displayName
          });
      }
      toast.success("Google Login successful");
      navigate(role === "admin" ? "/admin" : "/guard");
    } catch (err: any) {
      toast.error(err.message || "Google Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-neutral-900 p-4">
      <Card className="w-full max-w-md shadow-xl bg-white border-none">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto bg-black p-3 rounded-full inline-block">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">SecurePatrol</CardTitle>
            <CardDescription>Enter your credentials to access the system</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email / Username
              </label>
              <Input 
                type="email" 
                placeholder="guard@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password
              </label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-black text-white" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>

          <Button 
            type="button" 
            variant="outline"
            className="w-full mb-6 border border-neutral-300"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-500">Or preview as role</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              className="w-full" 
              onClick={() => handleDemoLogin("admin")}
              disabled={loading}
            >
              <UserCog className="w-4 h-4 mr-2" />
              Demo Admin
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              className="w-full" 
              onClick={() => handleDemoLogin("guard")}
              disabled={loading}
            >
              <ShieldCheck className="w-4 h-4 mr-2" />
              Demo Guard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
