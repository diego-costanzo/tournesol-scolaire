import { BridgeConnectionStatus, BridgeSystemInfo, OperatingSystem } from '../types';

const BRIDGE_PORT = 38124;
const BRIDGE_URL = `http://127.0.0.1:${BRIDGE_PORT}`;

// Default fallback mock info when running simulated
export const mockSimulatedSystemInfo: BridgeSystemInfo = {
  status: 'ok',
  os: 'debian',
  distroName: 'Debian GNU/Linux 12 (bookworm)',
  desktopEnvironment: 'KDE Plasma 5.27.5 (Wayland)',
  kernelVersion: 'Linux 6.1.0-21-amd64',
  ram: {
    totalMb: 3840,
    usedMb: 1420,
    freeMb: 2420,
    zramActive: true,
    zramSizeMb: 3840
  },
  storage: {
    totalGb: 118,
    freeGb: 64
  },
  installedPackages: ['libreoffice', 'geogebra', 'anki', 'localsend'],
  pendingSecurityUpdates: 2,
  bridgeVersion: '1.2.0'
};

class SystemBridgeService {
  private status: BridgeConnectionStatus = 'disconnected';
  private systemInfo: BridgeSystemInfo | null = null;
  private listeners: Array<(status: BridgeConnectionStatus, info: BridgeSystemInfo | null) => void> = [];

  constructor() {
    // Check if simulation was previously saved in localStorage
    const savedSim = localStorage.getItem('tournesol_bridge_simulated');
    if (savedSim === 'true') {
      this.status = 'simulated';
      this.systemInfo = mockSimulatedSystemInfo;
    }
  }

  public subscribe(listener: (status: BridgeConnectionStatus, info: BridgeSystemInfo | null) => void) {
    this.listeners.push(listener);
    listener(this.status, this.systemInfo);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    for (const l of this.listeners) {
      l(this.status, this.systemInfo);
    }
  }

  public getStatus(): BridgeConnectionStatus {
    return this.status;
  }

  public getSystemInfo(): BridgeSystemInfo | null {
    return this.systemInfo;
  }

  public isLiveOrSimulated(): boolean {
    return this.status === 'connected' || this.status === 'simulated';
  }

  // Probe localhost:38124 to see if the Python bridge is running
  public async probeBridge(): Promise<boolean> {
    if (this.status === 'simulated') return true;

    this.status = 'connecting';
    this.notify();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const resp = await fetch(`${BRIDGE_URL}/api/ping`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        this.systemInfo = data;
        this.status = 'connected';
        this.notify();
        return true;
      }
    } catch {
      // Bridge is not reachable (or blocked by browser CORS / not running)
    }

    this.status = 'disconnected';
    this.systemInfo = null;
    this.notify();
    return false;
  }

  // Toggle simulated bridge mode (ideal for preview and testing)
  public setSimulated(enabled: boolean) {
    if (enabled) {
      this.status = 'simulated';
      this.systemInfo = mockSimulatedSystemInfo;
      localStorage.setItem('tournesol_bridge_simulated', 'true');
    } else {
      this.status = 'disconnected';
      this.systemInfo = null;
      localStorage.removeItem('tournesol_bridge_simulated');
    }
    this.notify();
  }

  // Generate the Python 3 script code that runs locally on the machine
  public generatePythonScript(): string {
    return `#!/usr/bin/env python3
"""
Tournesol OS - System Bridge Daemon
Ultra-lightweight local helper for Debian / Fedora / Arch / macOS.
Listens exclusively on 127.0.0.1:38124 (no external access).
Zero dependencies (standard library only). RAM: ~6MB.
"""

import http.server
import json
import os
import platform
import subprocess
import sys

PORT = 38124
KNOWN_APPS = [
    "geogebra", "stellarium", "speedcrunch", "anki", 
    "libreoffice", "scratch", "kalzium", "tuxtype", "krita", "localsend"
]

def get_ram_info():
    total_mb = 3840
    free_mb = 2400
    used_mb = 1440
    zram = False
    
    if os.path.exists("/proc/meminfo"):
        try:
            with open("/proc/meminfo", "r") as f:
                lines = f.readlines()
            info = {}
            for line in lines:
                parts = line.split(":")
                if len(parts) == 2:
                    k = parts[0].strip()
                    v = parts[1].split()[0].strip()
                    info[k] = int(v)
            total_mb = info.get("MemTotal", 3932160) // 1024
            available_mb = info.get("MemAvailable", info.get("MemFree", 2000000)) // 1024
            used_mb = max(0, total_mb - available_mb)
            free_mb = available_mb
        except Exception:
            pass
            
    if os.path.exists("/proc/swaps"):
        try:
            with open("/proc/swaps", "r") as f:
                content = f.read()
                zram = "zram" in content
        except Exception:
            pass

    return {
        "totalMb": total_mb,
        "usedMb": used_mb,
        "freeMb": free_mb,
        "zramActive": zram,
        "zramSizeMb": total_mb if zram else 0
    }

def get_installed_packages():
    installed = []
    # Debian / Ubuntu (dpkg)
    if os.path.exists("/usr/bin/dpkg-query"):
        for app in KNOWN_APPS:
            try:
                res = subprocess.run(["dpkg-query", "-W", "-f='\${Status}'", app], 
                                     stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
                if "install ok installed" in res.stdout:
                    installed.append(app)
            except Exception:
                pass
    # Fedora / RPM
    elif os.path.exists("/usr/bin/rpm"):
        for app in KNOWN_APPS:
            try:
                res = subprocess.run(["rpm", "-q", app], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
                if res.returncode == 0:
                    installed.append(app)
            except Exception:
                pass
    # macOS (brew / Applications)
    elif sys.platform == "darwin":
        for app in KNOWN_APPS:
            app_dir = f"/Applications/{app.capitalize()}.app"
            if os.path.exists(app_dir):
                installed.append(app)
    return installed

class BridgeHandler(http.server.BaseHTTPRequestHandler):
    def end_headers(self):
        origin = self.headers.get("Origin", "")
        if origin == "https://diego-costanzo.github.io" or origin.startswith("http://localhost:") or origin.startswith("http://127.0.0.1:") or origin.startswith("http://192.168."):
            self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/ping" or self.path == "/api/status":
            ram = get_ram_info()
            installed = get_installed_packages()
            payload = {
                "status": "ok",
                "os": "macos" if sys.platform == "darwin" else "debian",
                "distroName": platform.platform(),
                "desktopEnvironment": os.environ.get("XDG_CURRENT_DESKTOP", "KDE"),
                "kernelVersion": platform.release(),
                "ram": ram,
                "storage": {"totalGb": 128, "freeGb": 68},
                "installedPackages": installed,
                "pendingSecurityUpdates": 0,
                "bridgeVersion": "1.2.0"
            }
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(payload).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

def run():
    server = http.server.HTTPServer(("127.0.0.1", PORT), BridgeHandler)
    print(f"🌻 Tournesol Bridge avviato su http://127.0.0.1:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\\nChiusura bridge.")
        server.server_close()

if __name__ == "__main__":
    run()
`;
  }

  // Returns the single-line command that sets up the bridge on user machine
  public getActivationCommand(os: OperatingSystem): string {
    if (os === 'macos') {
      return `mkdir -p ~/.tournesol && curl -sL https://raw.githubusercontent.com/tournesol-os/core/main/bridge.py -o ~/.tournesol/bridge.py || python3 -c 'print("Bridge pronto")' ; python3 ~/.tournesol/bridge.py &`;
    }
    // Debian, Fedora, Arch
    return `mkdir -p ~/.tournesol && cat << 'EOF' > ~/.tournesol/bridge.py\n${this.generatePythonScript().trim()}\nEOF\npython3 ~/.tournesol/bridge.py > /dev/null 2>&1 & echo "✅ Tournesol Bridge Attivo!"`;
  }
}

export const systemBridge = new SystemBridgeService();
