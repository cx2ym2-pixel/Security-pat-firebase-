import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Loader2, UserCog, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "react-toastify";
import { useAuth } from "../lib/auth-context";
import { db } from "../lib/db";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setMockUser, signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let user = db.getUserByEmail(email);
      if (!user) {
        // Automatically create user for demo flexibility if they do not exist instead of using Firebase
        user = {
           uid: Math.random().toString(36).substring(2, 9),
           email: email,
           role: email.includes("admin") ? "admin" : "guard",
           displayName: email.split("@")[0]
        };
        db.saveUser(user);
        toast.info("Created trial account for this email.");
      }

      // Check "password" - any password works for demo offline mockup
      signIn(user);
      toast.success("Login successful");
      navigate(user.role === "admin" ? "/admin" : "/guard");
    } catch (err: any) {
      toast.error(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: "admin" | "guard") => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setMockUser(role);
      toast.success(`Logged in as Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`);
      navigate(role === "admin" ? "/admin" : "/guard");
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
            <CardDescription>Enter your credentials to access the system (Offline Mode)</CardDescription>
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
                Password (Any works)
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
