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

Privacy: this process never sends data anywhere. It only downloads the school
iCal URL that you explicitly paste, and stores it locally in ~/.tournesol
with owner-only permissions (0600).
"""

import http.server
import ipaddress
import json
import os
import platform
import socket
import subprocess
import sys
import time
import urllib.parse
import urllib.request

PORT = 38124
BRIDGE_VERSION = "2.1.0"
DATA_DIR = os.path.join(os.path.expanduser("~"), ".tournesol")
CACHE_FILE = os.path.join(DATA_DIR, "pronote.ics")
CONFIG_FILE = os.path.join(DATA_DIR, "pronote.json")
DATA_FILE = os.path.join(DATA_DIR, "data.json")
MAX_BODY = 1024 * 1024
MAX_STORE = 5 * 1024 * 1024
MAX_ICS = 5 * 1024 * 1024
ALLOWED_ORIGINS = ("https://diego-costanzo.github.io",)
KNOWN_APPS = [
    "geogebra", "stellarium", "speedcrunch", "anki", 
    "libreoffice", "scratch", "kalzium", "tuxtype", "krita", "localsend"
]

def is_allowed_origin(origin):
    """Only the deployed app and local dev servers may talk to the bridge."""
    if not origin:
        return False
    if origin in ALLOWED_ORIGINS:
        return True
    try:
        parts = urllib.parse.urlsplit(origin)
    except Exception:
        return False
    return parts.scheme == "http" and parts.hostname in ("localhost", "127.0.0.1", "::1")

def is_safe_remote_url(url):
    """Accept only public HTTPS URLs (blocks SSRF towards LAN/loopback hosts)."""
    try:
        parts = urllib.parse.urlsplit(url)
    except Exception:
        return False
    if parts.scheme != "https" or not parts.hostname:
        return False
    host = parts.hostname.lower()
    if host in ("localhost", "127.0.0.1", "::1"):
        return False
    try:
        infos = socket.getaddrinfo(host, parts.port or 443, proto=socket.IPPROTO_TCP)
    except Exception:
        return False
    for info in infos:
        try:
            ip = ipaddress.ip_address(info[4][0])
        except Exception:
            return False
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            return False
    return True

def ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)
    try:
        os.chmod(DATA_DIR, 0o700)
    except Exception:
        pass

def read_cache():
    try:
        with open(CACHE_FILE, "r", encoding="utf-8") as handle:
            return handle.read()
    except Exception:
        return None

def save_cache(text):
    ensure_data_dir()
    tmp = CACHE_FILE + ".tmp"
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as handle:
        handle.write(text)
    os.replace(tmp, CACHE_FILE)

def read_saved_url():
    """The private school link never leaves this PC: it lives in ~/.tournesol (0600)."""
    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as handle:
            data = json.load(handle)
        url = str(data.get("url", "")).strip()
        return url or None
    except Exception:
        return None

def save_url(url):
    ensure_data_dir()
    tmp = CONFIG_FILE + ".tmp"
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as handle:
        json.dump({"url": url}, handle)
    os.replace(tmp, CONFIG_FILE)

def url_host(url):
    try:
        return urllib.parse.urlsplit(url).hostname or ""
    except Exception:
        return ""

def read_data():
    """Full backup stored on this PC only (~/.tournesol/data.json, 0600)."""
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as handle:
            return handle.read()
    except Exception:
        return None

def save_data(text):
    # Refuse anything that is not valid JSON: a corrupted file would break the app.
    json.loads(text)
    ensure_data_dir()
    tmp = DATA_FILE + ".tmp"
    fd = os.open(tmp, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w", encoding="utf-8") as handle:
        handle.write(text)
    os.replace(tmp, DATA_FILE)

def fetch_ical(url):
    """Download the user-provided school calendar. Returns (text, error)."""
    if not is_safe_remote_url(url):
        return None, "URL non valido: serve un link https pubblico (non localhost/LAN)."
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "Tournesol-Bridge/" + BRIDGE_VERSION}
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            if response.status != 200:
                return None, "Il server ha risposto " + str(response.status)
            data = response.read(MAX_ICS + 1)
    except Exception:
        return None, "Download non riuscito: controlla il link o la connessione."
    if len(data) > MAX_ICS:
        return None, "Il calendario supera i 5 MB."
    text = data.decode("utf-8", "replace")
    if "BEGIN:VCALENDAR" not in text:
        return None, "Il link non restituisce un calendario iCal valido."
    save_cache(text)
    return text, None

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
    server_version = "TournesolBridge"

    def log_message(self, fmt, *args):
        # Never log URLs or personal data.
        return

    def _send(self, code, payload=None, content_type="application/json; charset=utf-8"):
        if payload is None:
            body = b""
        elif isinstance(payload, str):
            body = payload.encode("utf-8")
        else:
            body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        origin = self.headers.get("Origin", "")
        if is_allowed_origin(origin):
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
            # Required by Chrome for public pages talking to 127.0.0.1 (PNA).
            self.send_header("Access-Control-Allow-Private-Network", "true")
        self.end_headers()
        if body:
            self.wfile.write(body)

    def do_OPTIONS(self):
        origin = self.headers.get("Origin", "")
        if not is_allowed_origin(origin):
            self._send(403, {"ok": False, "error": "origin not allowed"})
            return
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Access-Control-Max-Age", "600")
        self.end_headers()

    def do_GET(self):
        path = urllib.parse.urlsplit(self.path).path
        if path in ("/api/ping", "/api/status"):
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
                "bridgeVersion": BRIDGE_VERSION,
                "capabilities": ["pronote-ical", "pronote-saved-link", "local-store"]
            }
            self._send(200, payload)
        elif path == "/api/pronote/config":
            if not is_allowed_origin(self.headers.get("Origin", "")):
                self._send(403, {"ok": False, "error": "origin not allowed"})
                return
            saved = read_saved_url()
            self._send(200, {
                "ok": True,
                "configured": bool(saved),
                "host": url_host(saved or ""),
                "version": BRIDGE_VERSION
            })
        elif path == "/api/store":
            if not is_allowed_origin(self.headers.get("Origin", "")):
                self._send(403, {"ok": False, "error": "origin not allowed"})
                return
            text = read_data()
            if text is None:
                self._send(404, {"ok": False, "error": "no data"})
            else:
                self._send(200, text, "application/json; charset=utf-8")
        elif path == "/api/pronote/cache":
            if not is_allowed_origin(self.headers.get("Origin", "")):
                self._send(403, {"ok": False, "error": "origin not allowed"})
                return
            text = read_cache()
            if text is None:
                self._send(404, {"ok": False, "error": "cache empty"})
            else:
                self._send(200, text, "text/calendar; charset=utf-8")
        else:
            self._send(404, {"ok": False, "error": "not found"})

    def do_POST(self):
        path = urllib.parse.urlsplit(self.path).path
        if path not in ("/api/pronote/ical", "/api/store"):
            self._send(404, {"ok": False, "error": "not found"})
            return
        if not is_allowed_origin(self.headers.get("Origin", "")):
            self._send(403, {"ok": False, "error": "origin not allowed"})
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except Exception:
            length = 0
        limit = MAX_STORE if path == "/api/store" else MAX_BODY
        if length <= 0 or length > limit:
            self._send(400, {"ok": False, "error": "invalid body"})
            return
        try:
            raw = self.rfile.read(length).decode("utf-8")
        except Exception:
            self._send(400, {"ok": False, "error": "invalid body"})
            return
        if path == "/api/store":
            try:
                save_data(raw)
            except Exception:
                self._send(400, {"ok": False, "error": "invalid json"})
                return
            self._send(200, {
                "ok": True,
                "savedAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
                "bytes": len(raw)
            })
            return
        try:
            payload = json.loads(raw)
        except Exception:
            self._send(400, {"ok": False, "error": "invalid json"})
            return
        url = str(payload.get("url", "")).strip()
        if not url:
            # No link provided: reuse the one already stored on this PC (auto-refresh).
            url = read_saved_url() or ""
            if not url:
                self._send(400, {"ok": False, "error": "Nessun link salvato: inserisci il link del calendario una volta."})
                return
        text, error = fetch_ical(url)
        if error:
            self._send(400, {"ok": False, "error": error})
            return
        save_url(url)
        self._send(200, {
            "ok": True,
            "ics": text,
            "cachedAt": time.strftime("%Y-%m-%dT%H:%M:%S"),
            "bytes": len(text)
        })

def run():
    os.umask(0o077)
    ensure_data_dir()
    try:
        server = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), BridgeHandler)
    except OSError:
        print("La porta " + str(PORT) + " e' gia in uso: il bridge sembra gia attivo.")
        return
    print("Tournesol Bridge attivo su http://127.0.0.1:" + str(PORT))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()

if __name__ == "__main__":
    run()
`;
  }

  // Returns the command that sets up the bridge on the user machine and keeps
  // it running after every reboot (systemd user unit / macOS LaunchAgent).
  public getActivationCommand(_os: OperatingSystem): string {
    // The bridge is generated locally: never download and execute remote code blindly.
    // The script is written with owner-only permissions (0600) and listens on 127.0.0.1 only.
    return [
      'mkdir -p ~/.tournesol && chmod 700 ~/.tournesol',
      `cat > ~/.tournesol/bridge.py << 'TOURNESOL_EOF'\n${this.generatePythonScript().trim()}\nTOURNESOL_EOF`,
      'chmod 600 ~/.tournesol/bridge.py',
      'pkill -f "tournesol/bridge.py" 2>/dev/null || true',
      'if [ "$(uname)" = "Darwin" ]; then',
      '  mkdir -p ~/Library/LaunchAgents',
      '  cat > ~/Library/LaunchAgents/fr.tournesol.bridge.plist << TOURNESOL_PLIST',
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">',
      '<plist version="1.0"><dict>',
      '  <key>Label</key><string>fr.tournesol.bridge</string>',
      '  <key>ProgramArguments</key><array><string>/usr/bin/python3</string><string>$HOME/.tournesol/bridge.py</string></array>',
      '  <key>RunAtLoad</key><true/>',
      '  <key>KeepAlive</key><true/>',
      '  <key>StandardOutPath</key><string>$HOME/.tournesol/bridge.log</string>',
      '  <key>StandardErrorPath</key><string>$HOME/.tournesol/bridge.log</string>',
      '</dict></plist>',
      'TOURNESOL_PLIST',
      '  launchctl unload ~/Library/LaunchAgents/fr.tournesol.bridge.plist 2>/dev/null || true',
      '  launchctl load ~/Library/LaunchAgents/fr.tournesol.bridge.plist',
      'elif command -v systemctl >/dev/null 2>&1 && systemctl --user show-environment >/dev/null 2>&1; then',
      '  mkdir -p ~/.config/systemd/user',
      "  cat > ~/.config/systemd/user/tournesol-bridge.service << 'TOURNESOL_UNIT'",
      '[Unit]',
      'Description=Tournesol local bridge (127.0.0.1:38124)',
      'After=default.target',
      '',
      '[Service]',
      'Type=simple',
      'ExecStart=/usr/bin/env python3 %h/.tournesol/bridge.py',
      'Restart=on-failure',
      'RestartSec=5',
      'Environment=PYTHONUNBUFFERED=1',
      'NoNewPrivileges=true',
      'PrivateTmp=true',
      'ProtectSystem=full',
      'UMask=0077',
      '',
      '[Install]',
      'WantedBy=default.target',
      'TOURNESOL_UNIT',
      '  systemctl --user daemon-reload',
      '  systemctl --user enable --now tournesol-bridge.service',
      'else',
      '  (nohup python3 ~/.tournesol/bridge.py > ~/.tournesol/bridge.log 2>&1 &)',
      'fi',
      'sleep 1',
      'curl -s http://127.0.0.1:38124/api/ping >/dev/null 2>&1 && echo "✅ Tournesol Bridge attivo su http://127.0.0.1:38124 (si riavvia da solo ad ogni login)" || echo "⚠️ Bridge non raggiungibile: riprova. Log: ~/.tournesol/bridge.log"'
    ].join('\n');
  }
}

export const systemBridge = new SystemBridgeService();
