import { useEffect, useState } from "react";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Users, AlertTriangle, ShieldCheck, Clock, CheckCircle, Navigation } from "lucide-react";
import { ActivityChart } from "../../components/charts/ActivityChart";
import { db, PatrolLog, Incident, User } from "../../lib/db";

export default function AdminDashboard() {
  const [guards, setGuards] = useState<User[]>([]);
  const [logs, setLogs] = useState<PatrolLog[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    setGuards(db.getUsers().filter((u) => u.role === "guard"));
    setLogs(db.getPatrolLogs());
    setIncidents(db.getIncidents());

    // Update statistics every 3 seconds to feel live/realtime
    const interval = setInterval(() => {
      setGuards(db.getUsers().filter((u) => u.role === "guard"));
      setLogs(db.getPatrolLogs());
      setIncidents(db.getIncidents());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const activeGuardsCount = guards.filter((g) => g.status === "Active").length;
  const totalGuardsCount = guards.length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview Dashboard</h1>
          <p className="text-neutral-500">Live system status, emergency SOS reports, and daily patrol metrics (Offline Local Storage Integration).</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Active Guards</CardTitle>
              <Users className="w-4 h-4 text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeGuardsCount} / {totalGuardsCount}</div>
              <p className="text-xs text-neutral-500 mt-1">Guards marked as 'On Duty'</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Total Check-ins</CardTitle>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{logs.length}</div>
              <p className="text-xs text-neutral-500 mt-1">Verification audits verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Incident Reports</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{incidents.length}</div>
              <p className="text-xs text-neutral-500 mt-1">Require security supervisor review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-neutral-600">Avg. Patrol Time</CardTitle>
              <Clock className="w-4 h-4 text-neutral-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24m</div>
              <p className="text-xs text-neutral-500 mt-1">Check-in internal average</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Monitoring & Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Patrol Check-ins Trend (Completed Logs)</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityChart />
            </CardContent>
          </Card>
          
          {/* Live activity log */}
          <Card className="flex flex-col h-[400px]">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-md font-bold flex items-center justify-between">
                <span>Recent Live Streams</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {logs.length === 0 && incidents.length === 0 ? (
                <div className="text-center py-16 text-neutral-400 text-sm">
                  No checkpoints scanned yet.
                </div>
              ) : (
                <>
                  {/* SOS incidents highlighted on top */}
                  {incidents.slice(0, 5).map((inc) => (
                    <div key={inc.id} className="flex items-start space-x-3 p-2.5 bg-red-50 border border-red-100 rounded-xl text-sm transition-all hover:bg-red-100/50">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-red-900">{inc.type}</p>
                          <span className="text-[10px] text-red-500">{new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-neutral-700 mt-1 font-medium">{inc.description}</p>
                        <p className="text-neutral-500 text-[10px] mt-0.5">Guard: {inc.guardName || "Unknown Guard"}</p>
                      </div>
                    </div>
                  ))}

                  {/* Regular patrol logs */}
                  {logs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-2 hover:bg-neutral-50 rounded-lg text-sm transition-all">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="flex-1 text-xs">
                        <div className="flex justify-between items-center">
                          <p className="font-semibold text-neutral-900">Verified: {log.locationName}</p>
                          <span className="text-[10px] text-neutral-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-neutral-500 text-[10px] mt-1">Verified by {log.guardName || "Guard"} via GPS badge validation code: <span className="font-mono text-neutral-700 bg-neutral-100 px-1 rounded">{log.qrToken}</span></p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
