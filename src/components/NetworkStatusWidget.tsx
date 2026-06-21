import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, Layers, CheckCircle, Database, AlertCircle, Radio } from "lucide-react";
import { db, PendingQueueItem } from "../lib/db";
import { toast } from "react-toastify";

export function NetworkStatusWidget() {
  const [networkState, setNetworkState] = useState<'online' | 'unstable' | 'offline'>(() => db.getConnectionState());
  const [pendingQueue, setPendingQueue] = useState<PendingQueueItem[]>(() => db.getPendingQueue());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Listen for custom events dispatched by LocalDB on connection or queue changes
    const handleNetworkChange = () => {
      setNetworkState(db.getConnectionState());
    };

    const handleQueueChange = () => {
      setPendingQueue(db.getPendingQueue());
    };

    // Track real network status as a fallback when not explicitly simulated
    const handleRealOnline = () => {
      if (db.getConnectionState() !== 'offline') {
        db.setConnectionState('online');
      }
    };
    
    const handleRealOffline = () => {
      db.setConnectionState('offline');
    };

    window.addEventListener('network-status-change', handleNetworkChange);
    window.addEventListener('pending-queue-change', handleQueueChange);
    window.addEventListener('online', handleRealOnline);
    window.addEventListener('offline', handleRealOffline);

    return () => {
      window.removeEventListener('network-status-change', handleNetworkChange);
      window.removeEventListener('pending-queue-change', handleQueueChange);
      window.removeEventListener('online', handleRealOnline);
      window.removeEventListener('offline', handleRealOffline);
    };
  }, []);

  const handleStateChange = (state: 'online' | 'unstable' | 'offline') => {
    db.setConnectionState(state);
    toast.info(`Network connection mode set to: ${
      state === 'online' ? 'Stable (Online)' : state === 'unstable' ? 'Unstable (Degraded)' : 'Offline (No Connection)'
    }`);

    // If switched back to online, automatically trigger sync
    if (state === 'online' && db.getPendingQueue().length > 0) {
      triggerSync();
    }
  };

  const triggerSync = async () => {
    if (networkState === 'offline') {
      toast.warning("Cannot sync events while offline. Switch connect mode to Stable/Online first.");
      return;
    }

    setIsSyncing(true);
    // Simulate minor loading delays like a real network protocol ping
    setTimeout(async () => {
      try {
        const count = pendingQueue.length;
        const res = await db.syncPendingQueue();
        if (res.success && count > 0) {
          toast.success(`Synclink Complete: ${count} cached patrol events successfully uploaded!`);
        } else {
          toast.info("Synclink Check: Storage database fully synchronized.");
        }
      } catch (e: any) {
        toast.error("Failed to synchronize offline cached queue.");
      } finally {
        setIsSyncing(false);
      }
    }, 1200);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl space-y-4 text-white">
      {/* Network Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Radio className={`w-5 h-5 ${networkState === 'online' ? 'text-emerald-400 animate-pulse' : networkState === 'unstable' ? 'text-amber-400' : 'text-neutral-500'}`} />
          <h3 className="font-bold text-sm tracking-tight text-neutral-200">Device Wireless Node</h3>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
          networkState === 'online' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
          networkState === 'unstable' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
          'bg-neutral-800 text-neutral-400 border border-neutral-700'
        }`}>
          {networkState === 'online' ? 'Online' : networkState === 'unstable' ? 'Unstable' : 'Offline'}
        </span>
      </div>

      {/* Network Simulation Controls */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Connection Simulator (Test Offline Mode)</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleStateChange('online')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
              networkState === 'online'
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 font-extrabold ring-1 ring-emerald-500/20'
                : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-800 text-neutral-400'
            }`}
          >
            <Wifi className="w-3.5 h-3.5" />
            Stable
          </button>
          
          <button
            onClick={() => handleStateChange('unstable')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
              networkState === 'unstable'
                ? 'bg-amber-600/20 border-amber-500 text-amber-400 font-extrabold ring-1 ring-amber-500/20'
                : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-800 text-neutral-400'
            }`}
            title="50% packet drop rate. Simulates spotty network logging."
          >
            <Radio className="w-3.5 h-3.5" />
            Unstable
          </button>

          <button
            onClick={() => handleStateChange('offline')}
            className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 border ${
              networkState === 'offline'
                ? 'bg-red-600/20 border-red-500 text-red-400 font-extrabold ring-1 ring-red-500/20'
                : 'bg-neutral-950 border-neutral-800 hover:bg-neutral-800 text-neutral-400'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            Offline
          </button>
        </div>
      </div>

      {/* Sync Status Info */}
      <div className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-neutral-900 rounded-lg">
            <Layers className={`w-4 h-4 ${pendingQueue.length > 0 ? 'text-amber-400 animate-bounce' : 'text-neutral-500'}`} />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-300">Local Storage Queue</p>
            <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
              {pendingQueue.length === 0 ? '✓ Device fully synchronized' : `${pendingQueue.length} transactions pending upload`}
            </p>
          </div>
        </div>

        <button
          onClick={triggerSync}
          disabled={isSyncing || (pendingQueue.length === 0 && networkState !== 'offline')}
          className={`h-9 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all outline-none ${
            pendingQueue.length > 0 && networkState !== 'offline'
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer'
              : 'bg-neutral-900 border border-neutral-800 text-neutral-500 cursor-not-allowed'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Queue items micro list */}
      {pendingQueue.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Pending Cached Queue (Local Storage)</span>
          <div className="max-h-24 overflow-y-auto space-y-1 border border-neutral-800 rounded-lg p-1.5 bg-neutral-950/40 divide-y divide-neutral-900 scrollbar-thin">
            {pendingQueue.map((item) => (
              <div key={item.id} className="pt-1.5 pb-1 flex items-center justify-between text-[11px] text-neutral-400">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.type === 'incident' ? 'bg-red-500' : 'bg-amber-400'}`}></span>
                  <span className="font-semibold text-neutral-300 min-w-[50px] uppercase">{item.type}</span>
                  <span className="text-neutral-500 truncate max-w-[120px]">
                    {item.type === 'log' ? item.data.locationName : item.data.type}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-[9px] text-neutral-500 shrink-0 font-mono">
                  <span>{item.failReason || 'Cached'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
