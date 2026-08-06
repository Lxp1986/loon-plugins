// Browser-safe coordinate and Loon URL helpers. No network or storage access.

export const FIXED_LOCATIONS = Object.freeze([
  { name: "北京天安门", lat: 39.9087, lon: 116.3975, altitude: 50 },
  { name: "上海外滩", lat: 31.2400, lon: 121.4900, altitude: 10 },
  { name: "广州塔", lat: 23.1086, lon: 113.3245, altitude: 20 },
  { name: "深圳市民中心", lat: 22.5431, lon: 114.0579, altitude: 20 },
  { name: "香港中环", lat: 22.2819, lon: 114.1582, altitude: 15 },
  { name: "Apple Park", lat: 37.3349, lon: -122.0090, altitude: 30 },
]);

export function validateCoordinates(lat, lon) {
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("请输入数字形式的纬度和经度");
  }
  if (latitude < -90 || latitude > 90) {
    throw new Error("纬度必须在 -90 到 90 之间");
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error("经度必须在 -180 到 180 之间");
  }
  return { lat: latitude, lon: longitude };
}

export function parseCoordinateText(value) {
  const text = String(value ?? "").trim();
  const match = text.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*[,，;；\s]\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/);
  if (!match) throw new Error("请输入“纬度, 经度”，例如 22.5431, 114.0579");
  return validateCoordinates(match[1], match[2]);
}

function numberText(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : fallback;
}

export function buildLoonSaveUrl({ lat, lon, horizontalAccuracy = 39, verticalAccuracy = 1000 }) {
  const point = validateCoordinates(lat, lon);
  const params = new URLSearchParams({
    lat: numberText(point.lat, "0"),
    lon: numberText(point.lon, "0"),
    hacc: numberText(horizontalAccuracy, "39"),
    vacc: numberText(verticalAccuracy, "1000"),
  });
  return `https://gs-loc.apple.com/ils-settings/save?${params.toString()}`;
}

export function buildLoonClearUrl() {
  return "https://gs-loc.apple.com/ils-settings/save?action=clear";
}
