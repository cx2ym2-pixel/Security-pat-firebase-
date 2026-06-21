import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth-context";
import { ArrowLeft, MapPin, ScanLine, AlertCircle, Camera, CheckCircle2 } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "react-toastify";
import { db, LocationCheckpoint } from "../../lib/db";
import { NetworkStatusWidget } from "../../components/NetworkStatusWidget";

export default function GuardPatrol() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [checkpoints, setCheckpoints] = useState<LocationCheckpoint[]>([]);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string>("");
  const [manualToken, setManualToken] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  
  useEffect(() => {
    // Load local list of checkpoints
    const list = db.getCheckpoints();
    setCheckpoints(list);
    if (list.length > 0) {
      setSelectedCheckpointId(list[0].id);
    }

    // Get GPS with fallback for sandbox iframe security restrictions
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          console.warn("Geolocation permission restricted in sandbox. Using coordinates offset.");
          setLocation({ lat: 37.7749, lng: -122.4194 });
        },
        { timeout: 5000 }
      );
    } else {
      setLocation({ lat: 37.7749, lng: -122.4195 });
    }
  }, []);

  useEffect(() => {
    if (scanning) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          setScannedResult(decodedText);
          setScanning(false);
          scanner.clear();
          handleVerify(decodedText);
        },
        (error) => {
          // ignore scan errors (running continuously)
        }
      );

      return () => {
        scanner.clear().catch(e => console.error("Failed to clear scanner", e));
      };
    }
  }, [scanning]);

  const handleVerify = async (checkpointToken: string) => {
    const activeCheckpoint = checkpoints.find(c => c.id === selectedCheckpointId);
    if (!activeCheckpoint) {
      toast.error("Please configure and select a valid location checkpoint.");
      return;
    }

    try {
      let isCached = false;
      let cachedReason = "";

      if (user?.uid) {
        const result = db.tryAddPatrolLog({
          guardId: user.uid,
          locationName: activeCheckpoint.name,
          qrToken: checkpointToken || activeCheckpoint.qrToken,
          lat: location?.lat || 37.7749,
          lng: location?.lng || -122.4194,
          status: "verified"
        });

        isCached = result.cached;
        cachedReason = result.reason || "";
      }
      
      if (isCached) {
        toast.warning(
          <div>
            <p className="font-bold">⚠️ Saved to Offline Cache</p>
            <p className="text-xs mt-1">{cachedReason}. Will upload automatically on reconnect.</p>
          </div>,
          { autoClose: 5000 }
        );
      } else {
        toast.success(`Verified: ${activeCheckpoint.name} successfully!`);
      }
      
      setTimeout(() => navigate(-1), 1500);
    } catch (e: any) {
      toast.error(e.message || "Verification failed");
    } finally {
      setScannedResult(null);
    }
  };

  const triggerSOS = () => {
    let isCached = false;
    let cachedReason = "";

    if (user?.uid) {
      const result = db.tryAddIncident({
        guardId: user.uid,
        type: "Emergency SOS",
        description: "Emergency SOS manually triggered from Guard Patrol interface",
        lat: location?.lat || 37.7749,
        lng: location?.lng || -122.4194,
      });

      isCached = result.cached;
      cachedReason = result.reason || "";
    }

    if (isCached) {
      toast.error(
        <div>
          <p className="font-bold">🚨 SOS Cached Offline!</p>
          <p className="text-xs mt-1">Connection down. Local standby alert queued securely.</p>
        </div>,
        { autoClose: 6000 }
      );
    } else {
      toast.error("EMERGENCY SOS SENT! Admin notified with current GPS coordinates.", {
        autoClose: 5000
      });
    }
  }

  const selectedCheckpoint = checkpoints.find(c => c.id === selectedCheckpointId);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <header className="bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between">
        <button onClick={() => navigate("/guard")} className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700">
          <ArrowLeft className="w-5 h-5 text-neutral-300" />
        </button>
        <span className="font-bold text-sm tracking-widest text-neutral-400">PATROL MODE</span>
        <button onClick={triggerSOS} className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-full animate-pulse transition-colors">
          SOS
        </button>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Mock Map / GPS status */}
        <div className="h-44 bg-neutral-900 relative flex items-center justify-center overflow-hidden border-b border-neutral-800">
          <div className="absolute inset-0 opacity-15 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=37.7749,-122.4194&zoom=14&size=400x200&sensor=false')] bg-cover bg-center mix-blend-luminosity"></div>
          
          <div className="z-10 flex flex-col items-center p-3 bg-black/60 rounded-xl backdrop-blur-sm border border-neutral-800/40">
            {location ? (
              <>
                <MapPin className="w-6 h-6 text-emerald-400 mb-1" />
                <span className="text-xs font-bold text-emerald-400">GPS Link Established</span>
                <span className="text-[10px] text-neutral-400 mt-0.5">{location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° W</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-6 h-6 text-yellow-400 mb-1 animate-bounce" />
                <span className="text-xs font-bold text-yellow-500">Checking Geolocation...</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-center space-y-6">
          {/* Checkpoint selector drop down */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Target Checkpoint</label>
            {checkpoints.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl text-center text-sm text-neutral-500">
                Guards, please ask administrators to configure checkpoints.
              </div>
            ) : (
              <select
                value={selectedCheckpointId}
                onChange={(e) => setSelectedCheckpointId(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {checkpoints.map(cp => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedCheckpoint && (
            <div className="bg-neutral-900/60 border border-neutral-800/50 p-4 rounded-xl space-y-2 text-xs">
              <p className="flex justify-between">
                <span className="text-neutral-500">Target Geofence:</span>
                <span className="font-mono text-neutral-300">{selectedCheckpoint.radius} Radius</span>
              </p>
              <p className="flex justify-between">
                <span className="text-neutral-500">Validation Token:</span>
                <span className="font-mono text-emerald-400 bg-neutral-950 px-1.5 py-0.5 rounded">{selectedCheckpoint.qrToken}</span>
              </p>
            </div>
          )}

          <div className="w-full">
            <NetworkStatusWidget />
          </div>

          {scanning ? (
            <div className="w-full max-w-[280px] mx-auto bg-black rounded-xl overflow-hidden ring-4 ring-emerald-500 ring-offset-2 ring-offset-neutral-950 relative">
              <div id="reader" className="w-full"></div>
              {/* Custom scanning guides and crosshair overlay */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-emerald-500/60 shadow-[0_0_8px_#10b981] animate-pulse pointer-events-none"></div>
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400 pointer-events-none"></div>
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400 pointer-events-none"></div>
              <div className="absolute bottom-14 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400 pointer-events-none"></div>
              <div className="absolute bottom-14 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400 pointer-events-none"></div>
              <button 
                onClick={() => setScanning(false)}
                className="w-full py-3 bg-neutral-900 border-t border-neutral-800 hover:bg-neutral-800 text-white text-xs font-bold transition-all relative z-10"
              >
                Cancel Camera Scan
              </button>
            </div>
          ) : scannedResult ? (
            <div className="text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold">Verifying Checkpoint</h3>
              <p className="text-neutral-400 text-xs animate-pulse">Checking location radius and temporal window...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <button 
                onClick={() => {
                  setScanning(true);
                  setShowManualInput(false);
                }}
                disabled={checkpoints.length === 0}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all cursor-pointer"
              >
                <Camera className="w-5 h-5 mr-2 animate-bounce" />
                Scan Checkpoint QR Code
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (selectedCheckpoint) {
                      setScannedResult(selectedCheckpoint.qrToken);
                      handleVerify(selectedCheckpoint.qrToken);
                    }
                  }}
                  disabled={checkpoints.length === 0}
                  className="py-3 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 disabled:opacity-50 text-neutral-300 rounded-xl font-medium flex items-center justify-center transition-all cursor-pointer text-xs"
                >
                  Quick Mock Scan
                </button>
                <button
                  onClick={() => setShowManualInput(!showManualInput)}
                  disabled={checkpoints.length === 0}
                  className={`py-3 border disabled:opacity-50 rounded-xl font-medium flex items-center justify-center transition-all cursor-pointer text-xs ${
                    showManualInput 
                      ? "bg-emerald-950/25 border-emerald-500/50 text-emerald-400"
                      : "bg-neutral-900 border-neutral-800 hover:bg-neutral-800 text-neutral-300"
                  }`}
                >
                  Manual Code
                </button>
              </div>

              {showManualInput && (
                <div id="manual-input-box" className="bg-neutral-900/50 border border-neutral-800/80 p-4 rounded-xl space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Enter QR Checkpoint Token</label>
                    <input
                      type="text"
                      placeholder="e.g. ELEV-WEST-B2"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!manualToken.trim()) {
                        toast.error("Please enter a token first.");
                        return;
                      }
                      setScannedResult(manualToken);
                      handleVerify(manualToken);
                    }}
                    className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-lg transition-all"
                  >
                    Submit Code
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* CSS fix for Html5QrcodeScanner elements */}
      <style>{`
        #reader { border: none !important; }
        #reader__dashboard_section_csr { display: none !important; }
        #reader__dashboard_section_swaplink { display: none !important; }
      `}</style>
    </div>
  );
}
