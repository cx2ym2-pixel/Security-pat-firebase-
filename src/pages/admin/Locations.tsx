import { AdminLayout } from "../../components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, MoreHorizontal, QrCode } from "lucide-react";

export default function AdminLocations() {
  const mockLocations = [
    { id: 1, name: "Main Gate", radius: "50m", lastPatrol: "10 mins ago", coords: "37.7749° N, 122.4194° W" },
    { id: 2, name: "Server Room", radius: "20m", lastPatrol: "1 hour ago", coords: "37.7750° N, 122.4195° W" },
    { id: 3, name: "Parking Level B", radius: "100m", lastPatrol: "3 hours ago", coords: "37.7748° N, 122.4190° W" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Patrol Locations</h1>
            <p className="text-neutral-500">Define checkpoints with GPS coordinates and QR tags.</p>
          </div>
          <Button className="bg-black text-white hover:bg-neutral-800">
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {mockLocations.map((loc) => (
            <Card key={loc.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                <div>
                  <CardTitle className="text-lg">{loc.name}</CardTitle>
                  <CardDescription className="text-xs mt-1">{loc.coords}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-neutral-600 mb-4">
                  <p>Radius: <span className="font-medium text-neutral-900">{loc.radius}</span></p>
                  <p>Last Patrol: <span className="font-medium text-neutral-900">{loc.lastPatrol}</span></p>
                </div>
                <Button variant="outline" className="w-full text-xs">
                  <QrCode className="w-4 h-4 mr-2" />
                  View QR Code
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
