import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";
import { LogOut, ShieldAlert, Navigation, Play, User as UserIcon } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { NetworkStatusWidget } from "../../components/NetworkStatusWidget";

export default function GuardDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const startPatrol = () => {
    navigate("/guard/patrol");
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* App Bar */}
      <header className="bg-black text-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-md">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-6 h-6 text-emerald-400" />
          <span className="font-bold tracking-tight text-lg">Guard App</span>
        </div>
        <button onClick={handleSignOut} className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
        
        <div className="text-center space-y-2">
          <div className="mx-auto bg-neutral-200 p-4 rounded-full inline-block mb-2">
            <UserIcon className="w-12 h-12 text-neutral-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900">Welcome, Guard</h2>
          <p className="text-neutral-500 text-sm">{user?.email}</p>
        </div>

        <Card className="w-full border-none shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4">Current Shift</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Status</span>
                <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">On Duty</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Location</span>
                <span className="font-medium">Zone A - Downtown</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Schedule</span>
                <span className="font-medium">08:00 AM - 04:00 PM</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-full">
          <NetworkStatusWidget />
        </div>

        <Button onClick={startPatrol} className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 text-lg transition-transform active:scale-95">
          <Play className="w-6 h-6 mr-3 fill-current" />
          Start Patrol Mode
        </Button>

      </main>

      {/* Bottom Nav Placeholder */}
      <footer className="bg-white border-t border-neutral-200 p-4 flex justify-around">
        <div className="flex flex-col items-center text-emerald-600">
          <Navigation className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">Patrol</span>
        </div>
        <div className="flex flex-col items-center text-neutral-400 line-through">
          <ShieldAlert className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">SOS</span>
        </div>
      </footer>
    </div>
  );
}
