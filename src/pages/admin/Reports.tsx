import { AdminLayout } from "../../components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { toast } from "react-toastify";
import { db } from "../../lib/db";
import { useEffect, useState } from "react";

export default function AdminReports() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    setLogs(db.getPatrolLogs());
  }, []);

  const exportToCSV = (reportName: string) => {
    if (window.top !== window.self) {
      toast.warning("File downloads may be restricted in the preview iframe. Please open the app in a new tab to export.");
      return;
    }

    let data: any[][] = [];

    if (reportName === "Daily Summary") {
      data = [
        ["Date & Time", "Guard Name", "Location Checkpoint", "Status", "Verification QR Card"],
        ...logs.map((log) => [
          new Date(log.timestamp).toLocaleString(),
          log.guardName || "Guard",
          log.locationName,
          log.status,
          log.qrToken || "GPS Verified",
        ]),
      ];
    } else {
      const incidents = db.getIncidents();
      data = [
        ["Date & Time", "Authorized Guard", "Incident Type", "Incident Brief / Description", "Coordinates"],
        ...incidents.map((inc) => [
          new Date(inc.timestamp).toLocaleString(),
          inc.guardName || "Guard",
          inc.type,
          inc.description,
          `${inc.lat ? inc.lat : ""}, ${inc.lng ? inc.lng : ""}`,
        ]),
      ];
    }

    const csvContent = data.map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${reportName.replace(/ /g, "_").toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${reportName} to CSV`);
  };

  const handlePrint = () => {
    if (window.top !== window.self) {
      toast.warning("Printing is restricted in the preview iframe. Please open the app in a new tab using the External Link button.");
      return;
    }
    window.print();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 print:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Reports</h1>
            <p className="text-neutral-500">Generate and export patrol and compliance reports.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Patrol Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-500">Comprehensive summary of all patrols, checkpoints hit, and missed areas for the last 24 hours.</p>
              <div className="flex space-x-3">
                <Button className="bg-black text-white w-full" onClick={handlePrint}>Generate PDF</Button>
                <Button variant="outline" className="w-full" onClick={() => exportToCSV("Daily Summary")}>Export CSV</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guard Attendance & Incident Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-500">Log of guard shifts, timestamps, device verifications, and SOS incident reports over the month.</p>
              <div className="flex space-x-3">
                <Button className="bg-black text-white w-full" onClick={handlePrint}>Generate PDF</Button>
                <Button variant="outline" className="w-full" onClick={() => exportToCSV("Attendance Log")}>Export CSV</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="hidden print:block w-full text-black bg-white">
        <div className="border-b border-neutral-300 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">SecurePatrol Report</h1>
            <p className="text-neutral-500 mt-1">Generated: {new Date().toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">System Administrator</p>
            <p className="text-neutral-500 text-sm">Automated Export</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Guard Activity Log</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-neutral-900 text-left">
              <th className="py-2 pr-4 font-semibold">Date</th>
              <th className="py-2 pr-4 font-semibold">Guard Name</th>
              <th className="py-2 pr-4 font-semibold">Location</th>
              <th className="py-2 pr-4 font-semibold">Status</th>
              <th className="py-2 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr className="border-b border-neutral-200">
                <td colSpan={5} className="py-4 text-center text-neutral-400">
                  No checkpoints scanned yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b border-neutral-200 text-xs">
                  <td className="py-2 pr-4">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-2 pr-4 font-medium">{log.guardName || "Guard"}</td>
                  <td className="py-2 pr-4 text-neutral-600">{log.locationName}</td>
                  <td className="py-2 pr-4">
                    <span className={log.status === "verified" ? "text-emerald-700 font-bold" : "text-red-600 font-bold"}>
                      {log.status === "verified" ? "Verified" : "Flagged"}
                    </span>
                  </td>
                  <td className="py-2 text-neutral-500">{log.qrToken || "GPS Verified Check-in"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        <div className="mt-12 text-center text-neutral-400 text-xs text-balance">
          This document contains restricted information. Do not distribute without authorization.
        </div>
      </div>
    </AdminLayout>
  );
}
