import { useState, useEffect, FormEvent } from "react";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, Trash2, QrCode, X, MapPin, ShieldAlert, Copy, ExternalLink, Focus } from "lucide-react";
import { db, LocationCheckpoint } from "../../lib/db";
import { toast } from "react-toastify";

export default function AdminLocations() {
  const [locations, setLocations] = useState<LocationCheckpoint[]>([]);
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [selectedQR, setSelectedQR] = useState<LocationCheckpoint | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [radius, setRadius] = useState("50m");
  const [coords, setCoords] = useState("");
  const [qrToken, setQrToken] = useState("");

  const refreshLocations = () => {
    setLocations(db.getCheckpoints());
  };

  useEffect(() => {
    refreshLocations();
  }, []);

  // Set default coordinates on open
  useEffect(() => {
    if (isOpenForm && !coords) {
      const randomLat = (37.7749 + (Math.random() - 0.5) * 0.01).toFixed(4);
      const randomLng = (-122.4194 + (Math.random() - 0.5) * 0.01).toFixed(4);
      setCoords(`${randomLat}° N, ${randomLng}° W`);
    }
  }, [isOpenForm, coords]);

  const handleCreateLocation = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Location name is required");
      return;
    }

    const token = qrToken.trim() || `CHECKPOINT_${name.toUpperCase().replace(/\s+/g, "_")}`;
    const newLoc: LocationCheckpoint = {
      id: "loc_" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      radius: radius,
      coords: coords || "0.0000° N, 0.0000° W",
      qrToken: token,
    };

    db.saveCheckpoint(newLoc);
    toast.success(`Location ${name} added and registered!`);
    
    // reset form
    setName("");
    setRadius("50m");
    setCoords("");
    setQrToken("");
    setIsOpenForm(false);
    
    refreshLocations();
  };

  const handleDeleteLocation = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete Checkpoint ${name}?`)) {
      db.deleteCheckpoint(id);
      toast.success("Location checkpoint deleted");
      refreshLocations();
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    toast.success("QR Token copied to clipboard!");
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Patrol Locations</h1>
            <p className="text-neutral-500">Define checkpoints with GPS geofencing and QR validation tags.</p>
          </div>
          <Button 
            onClick={() => setIsOpenForm(true)}
            className="bg-black text-white hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>

        {/* Modal for Adding Checkpoint */}
        {isOpenForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-neutral-100">
              <div className="bg-black p-4 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold">Add New Checkpoint</span>
                </div>
                <button onClick={() => setIsOpenForm(false)} className="p-1 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateLocation} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Location Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Back Warehouse Entrance"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-700">Audit Radius</label>
                    <select
                      value={radius}
                      onChange={(e) => setRadius(e.target.value)}
                      className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                    >
                      <option value="15m">15 meters</option>
                      <option value="20m">20 meters</option>
                      <option value="50m">50 meters</option>
                      <option value="100m">100 meters</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-700">Coordinates</label>
                    <input
                      type="text"
                      placeholder="e.g. 37.77 N, 122.41 W"
                      value={coords}
                      onChange={(e) => setCoords(e.target.value)}
                      className="w-full border border-neutral-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Custom QR Token (Optional)</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if left blank"
                    value={qrToken}
                    onChange={(e) => setQrToken(e.target.value)}
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
                    Add Checkpoint
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal for Viewing/Downloading Mock QR */}
        {selectedQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-neutral-100">
              <div className="bg-black p-4 text-white flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  Checkpoint QR Badge
                </span>
                <button onClick={() => setSelectedQR(null)} className="p-1 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex flex-col items-center space-y-4 text-center">
                <h3 className="font-bold text-lg text-neutral-900">{selectedQR.name}</h3>
                
                {/* Simulated QR Code graphic with clean SVG/css representation */}
                <div className="p-4 border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50 relative">
                  <div className="w-44 h-44 bg-white border border-neutral-100 rounded-lg flex flex-col items-center justify-center relative p-2 shadow-inner">
                    {/* Corner anchors */}
                    <div className="absolute top-2 left-2 w-10 h-10 border-4 border-black bg-white flex items-center justify-center">
                      <div className="w-4 h-4 bg-black"></div>
                    </div>
                    <div className="absolute top-2 right-2 w-10 h-10 border-4 border-black bg-white flex items-center justify-center">
                      <div className="w-4 h-4 bg-black"></div>
                    </div>
                    <div className="absolute bottom-2 left-2 w-10 h-10 border-4 border-black bg-white flex items-center justify-center">
                      <div className="w-4 h-4 bg-black"></div>
                    </div>
                    {/* Simulated pixel array lines */}
                    <div className="space-y-1 w-28 flex flex-col items-center">
                      <div className="h-2 w-6/12 bg-neutral-900 rounded-full"></div>
                      <div className="h-2 w-9/12 bg-neutral-900 rounded-full"></div>
                      <div className="h-2 w-10/12 bg-neutral-900 rounded-full"></div>
                      <div className="h-2 w-8/12 bg-neutral-900 rounded-full"></div>
                      <div className="h-2 w-11/12 bg-neutral-900 rounded-full"></div>
                      <div className="h-2 w-7/12 bg-neutral-900 rounded-full"></div>
                    </div>
                    <Focus className="absolute w-12 h-12 text-emerald-500 opacity-60 pointer-events-none" />
                  </div>
                  <span className="absolute -bottom-2 transform translate-y-1 bg-black text-emerald-400 font-mono text-[9px] px-2 py-0.5 rounded-full border border-neutral-800">
                    SCAN VERIFIED OK
                  </span>
                </div>

                <div className="w-full bg-neutral-50 p-2.5 rounded-xl border border-neutral-100 flex items-center justify-between">
                  <code className="text-xs font-mono font-bold text-neutral-700 max-w-[200px] truncate">{selectedQR.qrToken}</code>
                  <button 
                    onClick={() => copyToken(selectedQR.qrToken)}
                    className="p-1.5 hover:bg-neutral-200 rounded-lg text-neutral-500 hover:text-black transition-colors"
                    title="Copy QR Token"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-neutral-500">
                  Guards on mobile patrol devices can scan or input this credential directly from their patrol terminal to verify high-accuracy attendance.
                </p>

                <Button 
                  onClick={() => setSelectedQR(null)} 
                  className="w-full bg-neutral-900 text-white hover:bg-neutral-800"
                >
                  Close View
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {locations.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-neutral-100">
              <ShieldAlert className="w-12 h-12 mx-auto text-neutral-300 mb-2" />
              <p className="font-bold text-lg text-neutral-700">No checkpoints defined</p>
              <p className="text-sm text-neutral-400 mt-1">Add your locations using the button on top.</p>
            </div>
          ) : (
            locations.map((loc) => (
              <Card key={loc.id} className="hover:-translate-y-0.5 transition-transform">
                <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                  <div>
                    <CardTitle className="text-lg font-bold text-neutral-900">{loc.name}</CardTitle>
                    <CardDescription className="text-xs mt-1 font-mono">{loc.coords}</CardDescription>
                  </div>
                  <button
                    onClick={() => handleDeleteLocation(loc.id, loc.name)}
                    className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Location"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-neutral-600 space-y-1 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                    <p className="flex justify-between">
                      <span className="text-neutral-500">Radius limits:</span> 
                      <span className="font-semibold text-neutral-900">{loc.radius}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-neutral-500">Token ID:</span> 
                      <span className="font-mono text-xs font-semibold text-neutral-800">{loc.qrToken}</span>
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedQR(loc)}
                    className="w-full text-xs font-semibold border-neutral-200 hover:bg-neutral-50 flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    View QR Code Badge
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
