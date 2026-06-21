import { AdminLayout } from "../../components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Download, Table as TableIcon } from "lucide-react";
import { useState } from "react";
import { linkGoogleWorkspace, getWorkspaceToken } from "../../lib/google-workspace";
import { toast } from "react-toastify";

export default function AdminReports() {
  const [isExporting, setIsExporting] = useState(false);
  const [hasWorkspace, setHasWorkspace] = useState(false);

  const handleConnectWorkspace = async () => {
    try {
      const result = await linkGoogleWorkspace();
      if (result?.accessToken) {
        setHasWorkspace(true);
        toast.success("Connected to Google Workspace!");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to connect Workspace");
    }
  };

  const exportToSheets = async (reportName: string) => {
    let token = await getWorkspaceToken();
    if (!token) {
      const confirmed = window.confirm("You need to sign in with Google to export to Sheets. Proceed?");
      if (!confirmed) return;
      
      try {
        const result = await linkGoogleWorkspace();
        if (result?.accessToken) {
          token = result.accessToken;
          setHasWorkspace(true);
        } else {
          return;
        }
      } catch (e) {
        return;
      }
    }

    setIsExporting(true);
    try {
      // Create a spreadsheet
      const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          properties: {
            title: `SecurePatrol Export: ${reportName} - ${new Date().toLocaleDateString()}`,
          },
        }),
      });

      if (!createRes.ok) throw new Error("Failed to create spreadsheet");
      const sheetData = await createRes.json();
      const spreadsheetId = sheetData.spreadsheetId;

      // Mock data population
      const mockDataRow = [
        "Date", "Guard Name", "Location", "Status", "Notes"
      ];
      
      const values = [mockDataRow, [new Date().toISOString().split("T")[0], "Guard 1", "Main Gate", "Checked In", "No issues"]];

      const updateRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1:E2?valueInputOption=USER_ENTERED`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values,
        }),
      });

      if (!updateRes.ok) throw new Error("Failed to populate spreadsheet");

      toast.success(
        <div>
          Export successful! <br/>
          <a
            href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-bold"
          >
            Open Google Sheet
          </a>
        </div>,
        { autoClose: 10000 }
      );
    } catch (err: any) {
      toast.error(err.message || "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = (reportName: string) => {
    if (window.top !== window.self) {
      toast.warning("File downloads may be restricted in the preview iframe. Please open the app in a new tab to export.");
      return;
    }

    const data = reportName === "Daily Summary" 
      ? [
          ["Date", "Guard Name", "Location", "Status", "Notes"],
          [new Date().toISOString().split("T")[0], "Guard 1", "Main Gate", "Checked In", "No issues"],
          [new Date().toISOString().split("T")[0], "Guard 2", "North Wing", "Missed", "Delayed by traffic"],
        ]
      : [
          ["Date", "Guard Name", "Shift Start", "Shift End", "Incidents"],
          [new Date().toISOString().split("T")[0], "Guard 1", "08:00 AM", "04:00 PM", "0"],
          [new Date().toISOString().split("T")[0], "Guard 2", "04:00 PM", "12:00 AM", "1"],
        ];

    const csvContent = data.map(row => row.join(",")).join("\n");
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
          <div className="flex space-x-2">
            {!hasWorkspace ? (
              <Button onClick={handleConnectWorkspace} className="bg-white text-black border border-neutral-300 hover:bg-neutral-100">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Connect Sheets
              </Button>
            ) : (
              <Button variant="outline" className="text-emerald-700 border-emerald-200">
                Connected to Workspace
              </Button>
            )}
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
              <Button 
                onClick={() => exportToSheets("Daily Summary")} 
                disabled={isExporting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <TableIcon className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export to Google Sheets"}
              </Button>
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
              <Button 
                onClick={() => exportToSheets("Attendance Log")} 
                disabled={isExporting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <TableIcon className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export to Google Sheets"}
              </Button>
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
            <tr className="border-b border-neutral-200">
              <td className="py-2 pr-4">{new Date().toLocaleDateString()}</td>
              <td className="py-2 pr-4 font-medium">Guard 1</td>
              <td className="py-2 pr-4 text-neutral-600">Main Gate</td>
              <td className="py-2 pr-4"><span className="text-emerald-700">Checked In</span></td>
              <td className="py-2 text-neutral-500">No issues reported</td>
            </tr>
            <tr className="border-b border-neutral-200">
              <td className="py-2 pr-4">{new Date().toLocaleDateString()}</td>
              <td className="py-2 pr-4 font-medium">Guard 2</td>
              <td className="py-2 pr-4 text-neutral-600">North Wing</td>
              <td className="py-2 pr-4"><span className="text-red-600">Missed</span></td>
              <td className="py-2 text-neutral-500">Delayed by traffic</td>
            </tr>
          </tbody>
        </table>
        
        <div className="mt-12 text-center text-neutral-400 text-xs text-balance">
          This document contains restricted information. Do not distribute without authorization.
        </div>
      </div>
    </AdminLayout>
  );
}
