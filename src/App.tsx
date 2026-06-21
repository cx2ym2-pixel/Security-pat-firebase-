import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminGuards from "./pages/admin/Guards";
import AdminLocations from "./pages/admin/Locations";
import AdminReports from "./pages/admin/Reports";
import GuardDashboard from "./pages/guard/Dashboard";
import GuardPatrol from "./pages/guard/Patrol";

function PrivateRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole?: "admin" | "guard" }) {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === "admin" ? "/admin" : "/guard"} />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute allowedRole="admin"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/guards" element={<PrivateRoute allowedRole="admin"><AdminGuards /></PrivateRoute>} />
          <Route path="/admin/locations" element={<PrivateRoute allowedRole="admin"><AdminLocations /></PrivateRoute>} />
          <Route path="/admin/reports" element={<PrivateRoute allowedRole="admin"><AdminReports /></PrivateRoute>} />

          {/* Guard Routes */}
          <Route path="/guard" element={<PrivateRoute allowedRole="guard"><GuardDashboard /></PrivateRoute>} />
          <Route path="/guard/patrol" element={<PrivateRoute allowedRole="guard"><GuardPatrol /></PrivateRoute>} />
        </Routes>
      </div>
      <ToastContainer position="bottom-right" aria-label="Notifications" />
    </AuthProvider>
  );
}
