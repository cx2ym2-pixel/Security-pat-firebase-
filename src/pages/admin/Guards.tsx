import { AdminLayout } from "../../components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";

export default function AdminGuards() {
  const mockGuards = [
    { id: 1, name: "John Doe", email: "john@example.com", status: "Active", device: "Pixel 6" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", status: "Off Duty", device: "iPhone 13" },
    { id: 3, name: "Michael Vance", email: "mike@example.com", status: "Active", device: "Galaxy S22" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Security Guards</h1>
            <p className="text-neutral-500">Manage your patrol personnel and devices.</p>
          </div>
          <Button className="bg-black text-white hover:bg-neutral-800">
            <Plus className="w-4 h-4 mr-2" />
            Add Guard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Guard Roster</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-neutral-500 uppercase bg-neutral-50 border-b">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Device Match</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockGuards.map((guard) => (
                    <tr key={guard.id} className="bg-white border-b">
                      <td className="px-6 py-4 font-medium text-neutral-900">{guard.name}</td>
                      <td className="px-6 py-4 text-neutral-500">{guard.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          guard.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-600'
                        }`}>
                          {guard.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-500">{guard.device}</td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
