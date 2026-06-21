import { useState, useEffect, FormEvent } from "react";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, Trash2, ShieldAlert, X, ToggleLeft, ToggleRight, Smartphone } from "lucide-react";
import { db, User } from "../../lib/db";
import { toast } from "react-toastify";

export default function AdminGuards() {
  const [guards, setGuards] = useState<User[]>([]);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setWithEmail] = useState("");
  const [device, setDevice] = useState("");

  const refreshGuards = () => {
    const allUsers = db.getUsers();
    const guardUsers = allUsers.filter(u => u.role === "guard");
    setGuards(guardUsers);
  };

  useEffect(() => {
    refreshGuards();
  }, []);

  const handleCreateGuard = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and Email are required");
      return;
    }

    const emailLower = email.toLowerCase();
    const existing = db.getUserByEmail(emailLower);
    if (existing) {
       toast.error("A user with this email already exists!");
       return;
    }

    const newGuard: User = {
      uid: "g_" + Math.random().toString(36).substring(2, 9),
      displayName: name,
      email: emailLower,
      role: "guard",
      status: "Active",
      device: device.trim() || "Unconnected Device"
    };

    db.saveUser(newGuard);
    toast.success(`Guard ${name} added successfully!`);
    setName("");
    setWithEmail("");
    setDevice("");
    setIsOpenForm(false);
    refreshGuards();
  };

  const handleDeleteGuard = (uid: string, displayName: string) => {
    if (confirm(`Are you sure you want to delete Guard ${displayName}?`)) {
      db.deleteUser(uid);
      toast.success("Guard removed successfully");
      refreshGuards();
    }
  };

  const toggleGuardStatus = (guard: User) => {
    const nextStatus = guard.status === "Active" ? "Off Duty" : "Active";
    const updatedGuard = { ...guard, status: nextStatus };
    db.saveUser(updatedGuard);
    toast.info(`${guard.displayName} status changed to ${nextStatus}`);
    refreshGuards();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Security Guards</h1>
            <p className="text-neutral-500">Manage your patrol personnel and device authorizations.</p>
          </div>
          <Button 
            onClick={() => setIsOpenForm(true)}
            className="bg-black text-white hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Guard
          </Button>
        </div>

        {/* Modal Overlay for Adding Guard */}
        {isOpenForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-neutral-100">
              <div className="bg-black p-4 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold">Add Security Guard</span>
                </div>
                <button 
                  onClick={() => setIsOpenForm(false)} 
                  className="p-1 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateGuard} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. john@company.com"
                    value={email}
                    onChange={(e) => setWithEmail(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Assign Device Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Pixel 6"
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3 pt-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsOpenForm(false)}
                    className="w-full border-neutral-200 hover:bg-neutral-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-full bg-black text-white hover:bg-neutral-800"
                  >
                    Save Guard
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Guard Roster ({guards.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {guards.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <ShieldAlert className="w-12 h-12 mx-auto text-neutral-300 mb-3" />
                <p className="font-semibold">No guards found</p>
                <p className="text-sm mt-1">Add guards using the "Add Guard" button above.</p>
              </div>
            ) : (
              <div className="relative w-full overflow-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Status Toggle</th>
                      <th className="px-6 py-3">Authorized Device</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guards.map((guard) => (
                      <tr key={guard.uid} className="bg-white border-b hover:bg-neutral-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-neutral-900">{guard.displayName}</td>
                        <td className="px-6 py-4 text-neutral-500">{guard.email}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => toggleGuardStatus(guard)}
                            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                          >
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              guard.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {guard.status || "Active"}
                            </span>
                            {guard.status === "Active" ? (
                              <ToggleRight className="w-6 h-6 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-neutral-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-neutral-500">
                          <div className="flex items-center space-x-1.5">
                            <Smartphone className="w-4 h-4 text-neutral-400" />
                            <span>{guard.device || "Unconnected Device"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteGuard(guard.uid, guard.displayName)}
                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                            title="Delete Guard"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
