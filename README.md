# Deadpool

GPU Tweak‑style performance console prototype. This is a **fully runnable front‑end** (HTML/CSS/JS) that simulates profile switching, dials, and sliders in the browser.

## Run it
You can run it locally in two ways:

### Option 1: Open directly
1. Download or clone this repo.
2. Double‑click `index.html`.

### Option 2: Local web server (recommended)
```bash
python -m http.server 8000
```
Then open: `http://localhost:8000/index.html`

## Electron (ready to package as .exe)
This repo includes a minimal Electron wrapper so you can package the UI as a Windows `.exe`.

### Install dependencies
```bash
npm install
```

### Run the Electron app
```bash
npm run start
```

### Package a Windows build
```bash
npm run package:win
```
This outputs a Windows build under `dist/DeadpoolTweak-win32-x64/`.

## Are there more tweaks for max FPS?
Yes—there are **more potential settings** than the 38 bullet‑point items I listed earlier. That number was just a **starter checklist**, not a hard limit. The real number varies based on your **hardware, drivers, Windows build, BIOS options, and Fortnite renderer**. Instead of stacking hundreds of tweaks, the best results usually come from:

- **Dialing in a small set of high‑impact settings** (rendering mode, frame cap, GPU control panel, RAM/XMP, power plan).
- **Measuring FPS and 1% lows** after each change.
- **Avoiding “all‑in‑one” tweak tools** that make large, irreversible registry changes.

## More high‑impact optimizations (safe + measurable)
Use this list to go beyond the starter tweaks without risking system instability:

### Fortnite (in‑game)
- Performance Mode or DX11 (whichever is more stable on your GPU).
- Disable V‑Sync, Motion Blur, and Ray Tracing.
- Set 3D Resolution to 100% (lower only if GPU‑bound).
- Cap FPS slightly below refresh rate (e.g., 237 for 240Hz) for steadier frametimes.
- Use low view distance, low effects, low shadows for competitive play.

### Windows & drivers
- Use the **Ultimate Performance** or **High Performance** plan.
- Enable **Game Mode** (Windows 11).
- Enable **HAGS** if your GPU driver supports it and it improves frametimes.
- Disable background overlays (Xbox Game Bar, Discord overlays if stutters occur).
- Keep GPU driver clean and updated (clean install after major updates).

### BIOS & hardware
- Enable **XMP/EXPO** for RAM.
- Keep CPU and GPU temps stable to avoid throttling.
- Ensure Resizable BAR is enabled if supported (and stable).
- Use an SSD for Fortnite and keep 15–20% free space.

### Network & latency
- Prefer Ethernet over Wi‑Fi.
- Disable bandwidth‑heavy background apps during play.
- Use a lower‑latency DNS if your ISP DNS is slow (optional).

### Validation (measure gains)
- Use a consistent replay or training map for repeatable tests.
- Track **Average FPS**, **1% Lows**, and **frametime** after each change.
- Only keep tweaks that *measurably* improve 1% lows and frametime stability.

If you want a **max‑FPS preset list** tailored to your system, share:
- CPU / GPU / RAM / storage
- Monitor refresh rate
- Fortnite render mode (Performance, DX11, DX12)
- Current average FPS and 1% lows

I can then recommend the **highest‑impact tweaks** for your exact build.
