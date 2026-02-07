const telemetryBase = {
  fps: 263,
  low: 191,
  frametime: 4.9,
  latency: 8.1,
};

const profiles = {
  default: {
    label: "Default Mode",
    boost: "+14%",
    telemetry: { fps: 263, low: 191, frametime: 4.9, latency: 8.1 },
  },
  oc: {
    label: "OC Mode",
    boost: "+22%",
    telemetry: { fps: 295, low: 210, frametime: 4.3, latency: 7.2 },
  },
  silent: {
    label: "Silent Mode",
    boost: "+6%",
    telemetry: { fps: 236, low: 176, frametime: 5.8, latency: 9.6 },
  },
  rog: {
    label: "ROG Mode",
    boost: "+18%",
    telemetry: { fps: 284, low: 204, frametime: 4.6, latency: 7.8 },
  },
};

const sliderConfig = {
  power: { unit: "%", min: 70, max: 125, dial: "power" },
  voltage: { unit: " mV", min: 900, max: 1200 },
  boost: { unit: " MHz", min: 1500, max: 1900, dial: "clock" },
  memory: { unit: " MHz", min: 17000, max: 21000, dial: "mem" },
  fan1: { unit: "%", min: 0, max: 100, dial: "fan" },
  fan2: { unit: "%", min: 0, max: 100 },
};

const dialTargets = {
  temp: { max: 90, value: 36, meta: 83 },
  clock: { max: 2000, value: 210, meta: 1830 },
  power: { max: 125, value: 11, meta: 100 },
  fan: { max: 100, value: 0, meta: 70 },
  mem: { max: 100, value: 0, meta: 300 },
};

const state = {
  profile: "default",
  sliders: {
    power: 100,
    voltage: 1100,
    boost: 1630,
    memory: 19402,
    fan1: 100,
    fan2: 100,
  },
  toggles: {
    "fan-auto": true,
    "fan2-auto": true,
  },
};

const telemetryNodes = document.querySelectorAll("[data-telemetry]");
const profilePill = document.querySelector("[data-active-profile]");
const boostNode = document.querySelector("[data-boost]");
const latencyNode = document.querySelector("[data-latency]");
const toast = document.querySelector("[data-toast]");
const logList = document.querySelector("[data-log]");
const updateStatus = document.querySelector("[data-update]");
const navItems = document.querySelectorAll("[data-nav]");

const dialNodes = Array.from(document.querySelectorAll("[data-dial]")).reduce((acc, node) => {
  acc[node.dataset.dial] = node;
  return acc;
}, {});

const dialValueNodes = Array.from(document.querySelectorAll("[data-dial-value]")).reduce((acc, node) => {
  acc[node.dataset.dialValue] = node;
  return acc;
}, {});

const dialMetaNodes = Array.from(document.querySelectorAll("[data-dial-meta]")).reduce((acc, node) => {
  acc[node.dataset.dialMeta] = node;
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
  const boostDelta = (state.sliders.boost - 1630) / 20;
  const powerDelta = (state.sliders.power - 100) / 10;
  const fanPenalty = state.sliders.fan1 < 40 ? 4 : 0;

  output.fps += boostDelta + powerDelta - fanPenalty;
  output.low += boostDelta * 0.6 + powerDelta * 0.4 - fanPenalty * 0.4;
  output.latency = Math.max(5.2, output.latency - boostDelta * 0.04 + fanPenalty * 0.05);
  output.frametime = Math.max(3.6, output.frametime + (263 - output.fps) * 0.012);
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

const updateSliderValue = (key, value) => {
  const output = document.querySelector(`[data-slider-value="${key}"]`);
  const config = sliderConfig[key];
  if (output && config) {
    output.textContent = `${value}${config.unit}`;
  }
  if (config?.dial && dialValueNodes[config.dial]) {
    dialValueNodes[config.dial].textContent = value;
  }
  if (key === "fan1") {
    dialValueNodes.fan.textContent = value;
  }
  renderTelemetry();
};

const updateDial = (key, value) => {
  const dial = dialNodes[key];
  const target = dialTargets[key];
  if (!dial || !target) return;
  const progress = Math.min(1, value / target.max);
  const degrees = progress * 280;
  dial.style.background = `conic-gradient(var(--accent) ${degrees}deg, rgba(255, 255, 255, 0.1) 0deg)`;
  if (dialValueNodes[key]) {
    dialValueNodes[key].textContent = value;
  }
  if (dialMetaNodes[key]) {
    dialMetaNodes[key].textContent = target.meta;
  }
};

const tickDials = () => {
  Object.entries(dialTargets).forEach(([key, target]) => {
    const jitter = Math.round((Math.random() - 0.5) * 6);
    const value = Math.max(0, target.value + jitter);
    updateDial(key, value);
  });
};

const applyProfile = (profileKey) => {
  if (!profiles[profileKey]) return;
  state.profile = profileKey;
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.profileButton === profileKey);
  });
  updateProfileUI();
  logAction(`Applied ${profiles[profileKey].label}.`);
  showToast(`${profiles[profileKey].label} active.`);
};

const toggleSetting = (toggleKey, button) => {
  const current = state.toggles[toggleKey];
  const next = !current;
  state.toggles[toggleKey] = next;
  button.classList.toggle("active", next);
  const label = toggleKey.split("-").join(" ");
  logAction(`${label} ${next ? "enabled" : "disabled"}.`);
  showToast(`${label} ${next ? "enabled" : "disabled"}.`);
};

const setUpdateStatus = (message) => {
  if (updateStatus) {
    updateStatus.textContent = `Status: ${message}`;
  }
};

document.querySelectorAll("[data-profile-button]").forEach((button) => {
  button.addEventListener("click", () => applyProfile(button.dataset.profileButton));
});

document.querySelectorAll("[data-slider]").forEach((input) => {
  input.addEventListener("input", () => {
    const key = input.dataset.slider;
    const value = Number(input.value);
    state.sliders[key] = value;
    updateSliderValue(key, value);
    if (key === "power") {
      updateDial("power", Math.round(value * 0.11));
    }
    if (key === "boost") {
      updateDial("clock", Math.round(value / 8));
    }
    if (key === "fan1") {
      updateDial("fan", value);
    }
    if (key === "memory") {
      updateDial("mem", Math.round((value - 17000) / 40));
    }
  });
});

document.querySelectorAll("[data-toggle]").forEach((button) => {
  button.addEventListener("click", () => toggleSetting(button.dataset.toggle, button));
});

document.querySelectorAll("[data-toggle]").forEach((button) => {
  const key = button.dataset.toggle;
  if (state.toggles[key]) {
    button.classList.add("active");
  }
});

navItems.forEach((button) => {
  button.addEventListener("click", () => {
    navItems.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const label = button.textContent.trim();
    logAction(`Switched to ${label}.`);
    showToast(`${label} view ready.`);
  });
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "boost") {
      applyProfile("oc");
      return;
    }
    if (action === "backup") {
      showToast("Defaults restored.");
      logAction("Defaults restored to baseline.");
      return;
    }
    if (action === "restore") {
      applyProfile("default");
      logAction("System reset to Default Mode.");
      showToast("System reset.");
      return;
    }
    if (action === "export") {
      showToast("Report exported.");
      logAction("Performance report exported.");
      return;
    }
    if (action === "updates") {
      button.disabled = true;
      setUpdateStatus("Checking for new driver packs and profiles...");
      logAction("Update scan started.");
      window.setTimeout(() => {
        button.disabled = false;
        setUpdateStatus("New OC profile available. Ready to install.");
        showToast("Update scan complete.");
        logAction("Update scan complete. 1 profile ready.");
      }, 1400);
    }
  });
});

updateProfileUI();
renderTelemetry();
tickDials();
window.setInterval(tickDials, 2400);
