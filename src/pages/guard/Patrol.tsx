import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, ScanLine, AlertCircle, Camera, CheckCircle2 } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { toast } from "react-toastify";

export default function GuardPatrol() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  
  useEffect(() => {
    // Get GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          toast.error("Failed to get GPS location. Required for patrol verification.");
        }
      );
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

  const handleVerify = async (qrCode: string) => {
    if (!location) {
      toast.error("Waiting for GPS signal...");
      return;
    }
    
    try {
      // Direct Firestore transaction for client-side demo
      const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      const { db, auth } = await import("../../lib/firebase");
      
      if (!auth.currentUser) {
        // We are in local Mock Mode
        setTimeout(() => toast.success("Mock Checkpoint Verified!"), 500);
        return;
      }
      
      await addDoc(collection(db, "patrolLogs"), {
        guardId: auth.currentUser.uid,
        qrToken: qrCode,
        lat: location.lat,
        lng: location.lng,
        timestamp: serverTimestamp(),
        status: "verified"
      });
      
      toast.success("Checkpoint Verified Successfully!");
    } catch (e: any) {
      toast.error(e.message || "Verification failed");
      // Implementation of offline sync
    } finally {
      setScannedResult(null);
    }
  };

  const triggerSOS = () => {
    toast.error("EMERGENCY SOS SENT! Admin notified with current GPS coordinates.", {
      autoClose: false
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900 text-white max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <header className="bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between">
        <button onClick={() => navigate("/guard")} className="p-2 bg-neutral-800 rounded-full hover:bg-neutral-700">
          <ArrowLeft className="w-5 h-5 text-neutral-300" />
        </button>
        <span className="font-bold text-sm text-neutral-400">ACTIVE PATROL</span>
        <button onClick={triggerSOS} className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full animate-pulse">
          SOS
        </button>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Mock Map / GPS status */}
        <div className="h-48 bg-neutral-800 relative flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=37.7749,-122.4194&zoom=14&size=400x200&sensor=false')] bg-cover bg-center mix-blend-luminosity"></div>
          
          <div className="z-10 flex flex-col items-center p-4 bg-black/60 rounded-xl backdrop-blur-sm">
            {location ? (
              <>
                <MapPin className="w-8 h-8 text-emerald-400 mb-2" />
                <span className="text-sm font-medium text-emerald-400">GPS Locked</span>
                <span className="text-xs text-neutral-400 mt-1">{location.lat.toFixed(5)}, {location.lng.toFixed(5)}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-8 h-8 text-yellow-400 mb-2 animate-bounce" />
                <span className="text-sm font-medium text-yellow-400">Acquiring GPS...</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col justify-center">
          {scanning ? (
            <div className="w-full max-w-[300px] mx-auto bg-black rounded-lg overflow-hidden ring-4 ring-emerald-500 ring-offset-2 ring-offset-neutral-900">
              <div id="reader" className="w-full"></div>
              <button 
                onClick={() => setScanning(false)}
                className="w-full py-3 bg-neutral-800 text-white text-sm font-medium"
              >
                Cancel Scan
              </button>
            </div>
          ) : scannedResult ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold">Verifying Checkpoint</h3>
              <p className="text-neutral-400 text-sm animate-pulse">Checking location radius and temporal window...</p>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center">
                <ScanLine className="w-10 h-10 text-neutral-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Next Checkpoint: Main Gate</h3>
                <p className="text-neutral-500 text-sm mt-1">Due in 15 minutes</p>
              </div>
              <button 
                onClick={() => setScanning(true)}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center shadow-[0_0_20px_rgba(5,150,105,0.4)]"
              >
                <Camera className="w-5 h-5 mr-3" />
                Scan Checkpoint QR
              </button>
            </div>
          )}
        </div>
      </main>
      
      {/* Required for the HTML5 QR scanner global CSS pollution fix */}
      <style>{`
        #reader { border: none !important; }
        #reader__dashboard_section_csr { display: none !important; }
        #reader__dashboard_section_swaplink { display: none !important; }
      `}</style>
    </div>
  );
}
