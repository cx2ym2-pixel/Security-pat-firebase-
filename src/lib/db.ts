export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'guard';
  status?: string; // 'Active' | 'Off Duty'
  device?: string;  // e.g. 'Pixel 6', 'iPhone 13'
}

export interface LocationCheckpoint {
  id: string;
  name: string;
  radius: string; // e.g. '50m'
  coords: string; // e.g. '37.7749° N, 122.4194° W'
  qrToken: string; // token content
}

export interface PatrolLog {
  id: string;
  guardId: string;
  guardName?: string;
  locationName: string;
  qrToken?: string;
  lat?: number;
  lng?: number;
  timestamp: string;
  status: 'verified' | 'flagged';
  notes?: string;
}

export interface Incident {
  id: string;
  guardId: string;
  guardName?: string;
  type: string;
  description: string;
  timestamp: string;
  lat?: number;
  lng?: number;
}

export interface PendingQueueItem {
  id: string;
  type: 'log' | 'incident';
  data: any;
  timestamp: string;
  failReason?: string;
}

class LocalDB {
  constructor() {
    this.seedDefaults();
  }

  private get<T>(key: string, defaultValue: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }

  private set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private seedDefaults(): void {
    // Seed Users if empty
    if (!localStorage.getItem('users')) {
      const defaultUsers: User[] = [
        { uid: "admin_user", email: "admin@example.com", displayName: "Super Admin", role: "admin", status: "Active", device: "MacBook Pro" },
        { uid: "guard_1", email: "guard1@example.com", displayName: "John Doe", role: "guard", status: "Active", device: "Pixel 6" },
        { uid: "guard_2", email: "guard2@example.com", displayName: "Jane Smith", role: "guard", status: "Off Duty", device: "iPhone 13" },
        { uid: "guard_3", email: "guard3@example.com", displayName: "Michael Vance", role: "guard", status: "Active", device: "Galaxy S22" },
      ];
      this.set('users', defaultUsers);
    }

    // Seed Locations Checkpoints if empty
    if (!localStorage.getItem('checkpoints')) {
      const defaultLocations: LocationCheckpoint[] = [
        { id: "loc_1", name: "Main Gate", radius: "50m", coords: "37.7749° N, 122.4194° W", qrToken: "CHECKPOINT_MAIN_GATE" },
        { id: "loc_2", name: "Server Room", radius: "20m", coords: "37.7750° N, 122.4195° W", qrToken: "CHECKPOINT_SERVER_ROOM" },
        { id: "loc_3", name: "Parking Level B", radius: "100m", coords: "37.7748° N, 122.4190° W", qrToken: "CHECKPOINT_PARKING_B" },
        { id: "loc_4", name: "Back Depot Exit", radius: "40m", coords: "37.7761° N, 122.4201° W", qrToken: "CHECKPOINT_BACK_DEPOT" },
      ];
      this.set('checkpoints', defaultLocations);
    }

    // Seed Patrol Logs if empty
    if (!localStorage.getItem('patrolLogs')) {
      const defaultLogs: PatrolLog[] = [
        { id: "log_1", guardId: "guard_1", guardName: "John Doe", locationName: "Main Gate", qrToken: "CHECKPOINT_MAIN_GATE", timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), status: "verified" },
        { id: "log_2", guardId: "guard_1", guardName: "John Doe", locationName: "Server Room", qrToken: "CHECKPOINT_SERVER_ROOM", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), status: "verified" },
        { id: "log_3", guardId: "guard_3", guardName: "Michael Vance", locationName: "Parking Level B", qrToken: "CHECKPOINT_PARKING_B", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: "verified" },
        { id: "log_4", guardId: "guard_2", guardName: "Jane Smith", locationName: "Back Depot Exit", qrToken: "CHECKPOINT_BACK_DEPOT", timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), status: "verified" },
      ];
      this.set('patrolLogs', defaultLogs);
    }

    // Seed Incidents if empty
    if (!localStorage.getItem('incidents')) {
      const defaultIncidents: Incident[] = [
        { id: "inc_1", guardId: "guard_3", guardName: "Michael Vance", type: "Intruder Alert", description: "Suspicious individual spotted lingering around Parking Level B near elevator bay.", timestamp: new Date(Date.now() - 1000 * 60 * 85).toISOString(), lat: 37.7748, lng: -122.4190 },
        { id: "inc_2", guardId: "guard_1", guardName: "John Doe", type: "Equipment Issue", description: "Server Room high-temperature indicator activated. Notified facilities.", timestamp: new Date(Date.now() - 1000 * 60 * 500).toISOString(), lat: 37.7750, lng: -122.4195 },
      ];
      this.set('incidents', defaultIncidents);
    }
  }

  public getUsers(): User[] {
    return this.get<User[]>('users', []);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email === email);
  }

  public getUserById(uid: string): User | undefined {
    return this.getUsers().find(u => u.uid === uid);
  }

  public saveUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.uid === user.uid);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    this.set('users', users);
  }

  public deleteUser(uid: string): void {
    const users = this.getUsers().filter(u => u.uid !== uid);
    this.set('users', users);
  }

  public getCheckpoints(): LocationCheckpoint[] {
    return this.get<LocationCheckpoint[]>('checkpoints', []);
  }

  public saveCheckpoint(checkpoint: LocationCheckpoint): void {
    const checkpoints = this.getCheckpoints();
    const index = checkpoints.findIndex(c => c.id === checkpoint.id);
    if (index >= 0) {
      checkpoints[index] = checkpoint;
    } else {
      checkpoints.push(checkpoint);
    }
    this.set('checkpoints', checkpoints);
  }

  public deleteCheckpoint(id: string): void {
    const checkpoints = this.getCheckpoints().filter(c => c.id !== id);
    this.set('checkpoints', checkpoints);
  }

  public getPatrolLogs(): PatrolLog[] {
    return this.get<PatrolLog[]>('patrolLogs', []);
  }

  public addPatrolLog(log: Omit<PatrolLog, 'id' | 'timestamp'>): PatrolLog {
    const logs = this.getPatrolLogs();
    const guard = this.getUserById(log.guardId);
    const newLog: PatrolLog = {
      ...log,
      guardName: guard ? guard.displayName : "Unknown Guard",
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog); // Put new log at the start (newest first)
    this.set('patrolLogs', logs);
    return newLog;
  }

  public getIncidents(): Incident[] {
    return this.get<Incident[]>('incidents', []);
  }

  public addIncident(incident: Omit<Incident, 'id' | 'timestamp'>): Incident {
    const incidents = this.getIncidents();
    const guard = this.getUserById(incident.guardId);
    const newIncident: Incident = {
      ...incident,
      guardName: guard ? guard.displayName : "Unknown Guard",
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    incidents.unshift(newIncident); // Put newest incident first
    this.set('incidents', incidents);
    return newIncident;
  }

  // --- Offline & Sync System ---
  public getConnectionState(): 'online' | 'unstable' | 'offline' {
    return this.get<'online' | 'unstable' | 'offline'>('connection_state', 'online');
  }

  public setConnectionState(state: 'online' | 'unstable' | 'offline'): void {
    this.set('connection_state', state);
    window.dispatchEvent(new CustomEvent('network-status-change', { detail: state }));
  }

  public getPendingQueue(): PendingQueueItem[] {
    return this.get<PendingQueueItem[]>('pending_queue', []);
  }

  public addToPendingQueue(type: 'log' | 'incident', data: any, failReason?: string): void {
    const queue = this.getPendingQueue();
    const item: PendingQueueItem = {
      id: "pending_" + Math.random().toString(36).substring(2, 9),
      type,
      data,
      timestamp: new Date().toISOString(),
      failReason: failReason || "Offline Cache"
    };
    queue.push(item);
    this.set('pending_queue', queue);
    window.dispatchEvent(new Event('pending-queue-change'));
  }

  public removeFromPendingQueue(id: string): void {
    const queue = this.getPendingQueue().filter(item => item.id !== id);
    this.set('pending_queue', queue);
    window.dispatchEvent(new Event('pending-queue-change'));
  }

  public clearPendingQueue(): void {
    this.set('pending_queue', []);
    window.dispatchEvent(new Event('pending-queue-change'));
  }

  public async syncPendingQueue(): Promise<{ success: boolean; syncedCount: number }> {
    const queue = this.getPendingQueue();
    if (queue.length === 0) {
      return { success: true, syncedCount: 0 };
    }

    let syncedCount = 0;
    for (const item of queue) {
      if (item.type === 'log') {
        this.addPatrolLog(item.data);
      } else if (item.type === 'incident') {
        this.addIncident(item.data);
      }
      syncedCount++;
    }

    this.clearPendingQueue();
    return { success: true, syncedCount };
  }

  public tryAddPatrolLog(log: Omit<PatrolLog, 'id' | 'timestamp'>): { success: boolean; data?: PatrolLog; cached: boolean; reason?: string } {
    const state = this.getConnectionState();
    if (state === 'offline') {
      this.addToPendingQueue('log', log, 'Device Offline');
      return { success: false, cached: true, reason: 'Device offline. Cached locally' };
    } else if (state === 'unstable') {
      // 50% simulated loss
      if (Math.random() < 0.5) {
        this.addToPendingQueue('log', log, 'Unstable Connection (Packet Drop)');
        return { success: false, cached: true, reason: 'Simulated Network Interruption (Cached)' };
      }
    }

    const data = this.addPatrolLog(log);
    return { success: true, data, cached: false };
  }

  public tryAddIncident(incident: Omit<Incident, 'id' | 'timestamp'>): { success: boolean; data?: Incident; cached: boolean; reason?: string } {
    const state = this.getConnectionState();
    if (state === 'offline') {
      this.addToPendingQueue('incident', incident, 'Device Offline');
      return { success: false, cached: true, reason: 'Device offline. Cached locally' };
    } else if (state === 'unstable') {
      // 50% simulated loss
      if (Math.random() < 0.5) {
        this.addToPendingQueue('incident', incident, 'Unstable Connection (Packet Drop)');
        return { success: false, cached: true, reason: 'Simulated Network Interruption (Cached)' };
      }
    }

    const data = this.addIncident(incident);
    return { success: true, data, cached: false };
  }
}

export const db = new LocalDB();
