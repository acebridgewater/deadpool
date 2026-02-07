const telemetryBase = {
  fps: 263,
  low: 191,
  frametime: 4.9,
  latency: 8.1,
};

const profiles = {
  balanced: {
    label: "Balanced",
    boost: "+14%",
    telemetry: { fps: 263, low: 191, frametime: 4.9, latency: 8.1 },
  },
  competitive: {
    label: "Competitive",
    boost: "+19%",
    telemetry: { fps: 281, low: 204, frametime: 4.5, latency: 7.4 },
  },
  "low-latency": {
    label: "Low Input Delay",
    boost: "+12%",
    telemetry: { fps: 258, low: 188, frametime: 5.1, latency: 6.6 },
  },
  streaming: {
    label: "Streaming Mode",
    boost: "+8%",
    telemetry: { fps: 240, low: 176, frametime: 5.7, latency: 9.2 },
  },
  creative: {
    label: "Creative Build",
    boost: "+15%",
    telemetry: { fps: 268, low: 196, frametime: 4.7, latency: 7.9 },
  },
};

const toggleImpacts = {
  "game-mode": { fps: 4, low: 3, latency: -0.2 },
  hags: { fps: 3, low: 2, latency: -0.1 },
  background: { fps: -5, low: -6, latency: 0.3 },
  "shader-cache": { fps: 2, low: 4, latency: -0.2 },
  "overclock-guard": { fps: -3, low: -2, latency: 0.4 },
};

const meterRanges = {
  cpu: { min: 26, max: 64 },
  gpu: { min: 42, max: 92 },
  ram: { min: 38, max: 72 },
};

const state = {
  profile: "balanced",
  toggles: {
    "game-mode": true,
    hags: true,
    background: false,
    "shader-cache": true,
    "overclock-guard": false,
  },
};

const telemetryNodes = document.querySelectorAll("[data-telemetry]");
const profilePill = document.querySelector("[data-active-profile]");
const boostNode = document.querySelector("[data-boost]");
const latencyNode = document.querySelector("[data-latency]");
const toast = document.querySelector("[data-toast]");
const logList = document.querySelector("[data-log]");
const updateStatus = document.querySelector("[data-update]");

const meters = Array.from(document.querySelectorAll("[data-meter]")).reduce((acc, node) => {
  acc[node.dataset.meter] = node;
  return acc;
}, {});

const bars = Array.from(document.querySelectorAll("[data-bar]")).reduce((acc, node) => {
  acc[node.dataset.bar] = node;
  return acc;
}, {});

const formatTelemetry = (value, key) => {
  if (key === "frametime" || key === "latency") {
    return `${value.toFixed(1)}ms`;
  }
  return Math.round(value).toString();
};

const logAction = (message) => {
  if (!logList) return;
  const item = document.createElement("li");
  item.className = "log-item";
  item.textContent = message;
  logList.prepend(item);
};

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
    toast.hidden = true;
  }, 2400);
};

const calculateTelemetry = () => {
  const base = profiles[state.profile]?.telemetry ?? telemetryBase;
  const output = { ...base };

  Object.entries(state.toggles).forEach(([key, enabled]) => {
    if (!enabled) return;
    const impact = toggleImpacts[key];
    if (!impact) return;
    output.fps += impact.fps ?? 0;
    output.low += impact.low ?? 0;
    output.latency += impact.latency ?? 0;
  });

  output.frametime = Math.max(3.8, output.frametime + (263 - output.fps) * 0.012);
  output.latency = Math.max(5.4, output.latency);
  return output;
};

const renderTelemetry = () => {
  const data = calculateTelemetry();
  telemetryNodes.forEach((node) => {
    const key = node.dataset.telemetry;
    node.textContent = formatTelemetry(data[key], key);
  });
  latencyNode.textContent = formatTelemetry(data.latency, "latency");
};

const updateProfileUI = () => {
  const profile = profiles[state.profile];
  if (!profile) return;
  profilePill.textContent = profile.label;
  boostNode.textContent = profile.boost;
  renderTelemetry();
};

const randomBetween = (min, max) => Math.round(min + Math.random() * (max - min));

const tickMeters = () => {
  Object.entries(meterRanges).forEach(([key, range]) => {
    const value = randomBetween(range.min, range.max);
    if (!meters[key] || !bars[key]) return;
    meters[key].textContent = key === "ram" ? `${(value / 5).toFixed(1)}GB` : `${value}%`;
    bars[key].style.width = `${value}%`;
  });
};

const applyProfile = (profileKey) => {
  if (!profiles[profileKey]) return;
  state.profile = profileKey;
  updateProfileUI();
  logAction(`Applied ${profiles[profileKey].label} profile.`);
  showToast(`${profiles[profileKey].label} profile active.`);
};

const toggleSetting = (toggleKey, enabled) => {
  state.toggles[toggleKey] = enabled;
  const status = enabled ? "enabled" : "disabled";
  const label = toggleKey.split("-").join(" ");
  renderTelemetry();
  logAction(`${label} ${status}.`);
  showToast(`${label} ${status}.`);
};

const setUpdateStatus = (message) => {
  if (updateStatus) {
    updateStatus.textContent = `Status: ${message}`;
  }
};

document.querySelectorAll("[data-profile-button]").forEach((button) => {
  button.addEventListener("click", () => applyProfile(button.dataset.profileButton));
});

document.querySelectorAll("[data-toggle]").forEach((input) => {
  input.addEventListener("change", (event) => {
    toggleSetting(input.dataset.toggle, event.target.checked);
  });
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "boost") {
      applyProfile("competitive");
      return;
    }
    if (action === "create") {
      showToast("Preset creator opened.");
      logAction("Preset creator opened.");
      return;
    }
    if (action === "backup") {
      showToast("Registry backup saved.");
      logAction("Registry backup saved to Desktop.");
      return;
    }
    if (action === "restore") {
      applyProfile("balanced");
      logAction("Defaults restored.");
      showToast("Defaults restored.");
      return;
    }
    if (action === "export") {
      showToast("Performance report exported.");
      logAction("Performance report exported as tweak-report.json.");
      return;
    }
    if (action === "updates") {
      button.disabled = true;
      button.textContent = "Scanning…";
      setUpdateStatus("Checking for new driver packs and presets...");
      logAction("Update scan started.");
      window.setTimeout(() => {
        button.disabled = false;
        button.textContent = "Check Updates";
        setUpdateStatus("Updates fetched. New Fortnite preset available.");
        showToast("Update scan complete.");
        logAction("Update scan complete. 1 preset ready to install.");
      }, 1400);
    }
  });
});

updateProfileUI();
renderTelemetry();
tickMeters();
window.setInterval(tickMeters, 2400);
