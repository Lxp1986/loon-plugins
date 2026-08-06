import {
  FIXED_LOCATIONS,
  buildLoonClearUrl,
  buildLoonSaveUrl,
  parseCoordinateText,
  validateCoordinates,
} from "./coordinate.js";

const $ = (id) => document.getElementById(id);
const preset = $("preset");
const status = $("status");

for (const [index, location] of FIXED_LOCATIONS.entries()) {
  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = location.name;
  preset.append(option);
}

preset.addEventListener("change", () => {
  const location = FIXED_LOCATIONS[Number(preset.value)];
  if (!location) return;
  $("lat").value = location.lat;
  $("lon").value = location.lon;
});

function setStatus(message, error = false) {
  status.textContent = message;
  status.classList.toggle("error", error);
}

function readPoint() {
  const point = validateCoordinates($("lat").value, $("lon").value);
  return {
    ...point,
    horizontalAccuracy: $("hacc").value,
    verticalAccuracy: $("vacc").value,
  };
}

function saveUrl() {
  return buildLoonSaveUrl(readPoint());
}

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

async function callLoon(url, successMessage) {
  try {
    const response = await fetch(url, { cache: "no-store", mode: "cors" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) throw new Error(data.error || `HTTP ${response.status}`);
    setStatus(successMessage);
  } catch (error) {
    setStatus(`网页没有拿到 Loon 回应：${error.message}。请先复制 URL，并确认 Loon、HTTPS 解密和 CA 信任均已开启。`, true);
  }
}

$("save").addEventListener("click", async () => {
  try {
    await callLoon(saveUrl(), "已请求 Loon 保存到本机。重新打开目标 App 后检查效果。");
  } catch (error) {
    setStatus(error.message, true);
  }
});

$("copySave").addEventListener("click", async () => {
  try {
    const url = saveUrl();
    await copyText(url);
    setStatus("保存 URL 已复制。请在 Loon 已连接且 CA 已信任时打开它。");
  } catch (error) {
    setStatus(error.message, true);
  }
});

$("restore").addEventListener("click", () => callLoon(buildLoonClearUrl(), "已请求恢复真实定位。"));
$("copyRestore").addEventListener("click", async () => {
  try {
    await copyText(buildLoonClearUrl());
    setStatus("恢复 URL 已复制。打开它即可关闭本机模拟定位。");
  } catch (error) {
    setStatus(error.message, true);
  }
});

// Keep the parser available for future static-page enhancements without adding a network dependency.
window.parseCoordinateText = parseCoordinateText;
