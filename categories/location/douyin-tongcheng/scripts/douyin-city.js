/*
 * 抖音同城任意门
 * 改写抖音 API 请求中的定位参数，把「同城」切换到世界上任何一个城市。
 *
 * 配置方式（优先级从高到低）：
 *   1. 插件参数 $argument：city=巴黎 / city=48.8566,2.3522
 *   2. Loon 插件配置项（#!input = 城市）：Loon 会自动写入 $persistentStore，key 为「城市」
 *
 * 输入接受：中文城市名 / 英文城市名 / 直接写 "纬度,经度"
 * 未配置或查不到城市 → 直接放行，不改动请求（fail-open）
 */

// [中文名, 英文名, 纬度, 经度]
var CITY_DB = [
  // 中国
  ["北京", "beijing", 39.9042, 116.4074],
  ["上海", "shanghai", 31.2304, 121.4737],
  ["广州", "guangzhou", 23.1291, 113.2644],
  ["深圳", "shenzhen", 22.5431, 114.0579],
  ["杭州", "hangzhou", 30.2741, 120.1551],
  ["成都", "chengdu", 30.5728, 104.0668],
  ["重庆", "chongqing", 29.5630, 106.5516],
  ["武汉", "wuhan", 30.5928, 114.3055],
  ["西安", "xian", 34.3416, 108.9398],
  ["南京", "nanjing", 32.0603, 118.7969],
  ["苏州", "suzhou", 31.2989, 120.5853],
  ["天津", "tianjin", 39.3434, 117.3616],
  ["香港", "hongkong", 22.3193, 114.1694],
  ["台北", "taipei", 25.0330, 121.5654],
  ["澳门", "macau", 22.1987, 113.5439],
  ["厦门", "xiamen", 24.4798, 118.0819],
  ["青岛", "qingdao", 36.0671, 120.3826],
  ["大连", "dalian", 38.9140, 121.6147],
  ["沈阳", "shenyang", 41.7968, 123.4291],
  ["长沙", "changsha", 28.2282, 112.9388],
  ["郑州", "zhengzhou", 34.7466, 113.6254],
  ["济南", "jinan", 36.6512, 117.1201],
  ["昆明", "kunming", 25.0389, 102.7183],
  ["贵阳", "guiyang", 26.6477, 106.6302],
  ["南宁", "nanning", 22.8170, 108.3669],
  ["福州", "fuzhou", 26.0745, 119.2965],
  ["合肥", "hefei", 31.8206, 117.2272],
  ["南昌", "nanchang", 28.6829, 115.8588],
  ["太原", "taiyuan", 37.8706, 112.5489],
  ["石家庄", "shijiazhuang", 38.0428, 114.5149],
  ["哈尔滨", "harbin", 45.8038, 126.5350],
  ["长春", "changchun", 43.8868, 125.3245],
  ["呼和浩特", "hohhot", 40.8426, 111.7496],
  ["银川", "yinchuan", 38.4872, 106.2309],
  ["兰州", "lanzhou", 36.0611, 103.8343],
  ["西宁", "xining", 36.6171, 101.7782],
  ["拉萨", "lhasa", 29.6500, 91.1000],
  ["乌鲁木齐", "urumqi", 43.8256, 87.6168],
  ["海口", "haikou", 20.0440, 110.1983],
  ["三亚", "sanya", 18.2528, 109.5119],
  // 亚洲其他
  ["东京", "tokyo", 35.6762, 139.6503],
  ["大阪", "osaka", 34.6937, 135.5023],
  ["首尔", "seoul", 37.5665, 126.9780],
  ["新加坡", "singapore", 1.3521, 103.8198],
  ["曼谷", "bangkok", 13.7563, 100.5018],
  ["吉隆坡", "kualalumpur", 3.1390, 101.6869],
  ["雅加达", "jakarta", -6.2088, 106.8456],
  ["马尼拉", "manila", 14.5995, 120.9842],
  ["胡志明市", "hochiminh", 10.8231, 106.6297],
  ["河内", "hanoi", 21.0278, 105.8342],
  ["新德里", "newdelhi", 28.6139, 77.2090],
  ["孟买", "mumbai", 19.0760, 72.8777],
  ["迪拜", "dubai", 25.2048, 55.2708],
  ["利雅得", "riyadh", 24.7136, 46.6753],
  ["伊斯坦布尔", "istanbul", 41.0082, 28.9784],
  // 欧洲
  ["伦敦", "london", 51.5074, -0.1278],
  ["巴黎", "paris", 48.8566, 2.3522],
  ["柏林", "berlin", 52.5200, 13.4050],
  ["罗马", "rome", 41.9028, 12.4964],
  ["米兰", "milan", 45.4642, 9.1900],
  ["巴塞罗那", "barcelona", 41.3874, 2.1686],
  ["马德里", "madrid", 40.4168, -3.7038],
  ["阿姆斯特丹", "amsterdam", 52.3676, 4.9041],
  ["布鲁塞尔", "brussels", 50.8503, 4.3517],
  ["维也纳", "vienna", 48.2082, 16.3738],
  ["苏黎世", "zurich", 47.3769, 8.5417],
  ["慕尼黑", "munich", 48.1351, 11.5820],
  ["法兰克福", "frankfurt", 50.1109, 8.6821],
  ["华沙", "warsaw", 52.2297, 21.0122],
  ["布拉格", "prague", 50.0755, 14.4378],
  ["布达佩斯", "budapest", 47.4979, 19.0402],
  ["雅典", "athens", 37.9838, 23.7275],
  ["里斯本", "lisbon", 38.7223, -9.1393],
  ["斯德哥尔摩", "stockholm", 59.3293, 18.0686],
  ["奥斯陆", "oslo", 59.9139, 10.7522],
  ["哥本哈根", "copenhagen", 55.6761, 12.5683],
  ["赫尔辛基", "helsinki", 60.1699, 24.9384],
  ["莫斯科", "moscow", 55.7558, 37.6173],
  ["圣彼得堡", "saintpetersburg", 59.9343, 30.3351],
  // 美洲
  ["纽约", "newyork", 40.7128, -74.0060],
  ["洛杉矶", "losangeles", 34.0522, -118.2437],
  ["旧金山", "sanfrancisco", 37.7749, -122.4194],
  ["西雅图", "seattle", 47.6062, -122.3321],
  ["芝加哥", "chicago", 41.8781, -87.6298],
  ["休斯顿", "houston", 29.7604, -95.3698],
  ["迈阿密", "miami", 25.7617, -80.1918],
  ["波士顿", "boston", 42.3601, -71.0589],
  ["拉斯维加斯", "lasvegas", 36.1699, -115.1398],
  ["檀香山", "honolulu", 21.3099, -157.8581],
  ["多伦多", "toronto", 43.6532, -79.3832],
  ["温哥华", "vancouver", 49.2827, -123.1207],
  ["蒙特利尔", "montreal", 45.5017, -73.5673],
  ["墨西哥城", "mexicocity", 19.4326, -99.1332],
  ["圣保罗", "saopaulo", -23.5558, -46.6396],
  ["里约热内卢", "riodejaneiro", -22.9068, -43.1729],
  ["布宜诺斯艾利斯", "buenosaires", -34.6037, -58.3816],
  // 大洋洲 / 非洲 / 中东
  ["悉尼", "sydney", -33.8688, 151.2093],
  ["墨尔本", "melbourne", -37.8136, 144.9631],
  ["奥克兰", "auckland", -36.8485, 174.7633],
  ["开罗", "cairo", 30.0444, 31.2357],
  ["开普敦", "capetown", -33.9249, 18.4241],
  ["内罗毕", "nairobi", -1.2921, 36.8219],
  ["特拉维夫", "telaviv", 32.0853, 34.7818]
];

function parseArgumentString(str) {
  var out = {};
  if (!str || typeof str !== "string") return out;
  var pairs = str.split(/[&;]/);
  for (var i = 0; i < pairs.length; i++) {
    var kv = pairs[i].split("=");
    if (kv.length >= 2) {
      var k = decodeURIComponent(kv[0].trim());
      var v = decodeURIComponent(kv.slice(1).join("=").trim());
      if (k) out[k] = v;
    }
  }
  return out;
}

function readRawCity() {
  // 1. 插件参数 $argument（字符串 "city=巴黎" 或对象 {city: "巴黎"}）
  try {
    if (typeof $argument !== "undefined" && $argument != null) {
      var args = typeof $argument === "string" ? parseArgumentString($argument) : $argument;
      if (args && args.city) return String(args.city).trim();
    }
  } catch (e) {}
  // 2. Loon 插件配置项 #!input = 城市（Loon 自动写入 $persistentStore）
  try {
    if (typeof $persistentStore !== "undefined" && $persistentStore.read) {
      var v = $persistentStore.read("城市");
      if (v != null && String(v).trim() !== "") return String(v).trim();
    }
  } catch (e) {}
  return "";
}

function findCity(name) {
  var key = String(name).trim().toLowerCase().replace(/\s+/g, "");
  if (!key) return null;
  for (var i = 0; i < CITY_DB.length; i++) {
    var c = CITY_DB[i];
    if (c[0] === String(name).trim()) return { lat: c[2], lng: c[3] };
    if (c[1] === key) return { lat: c[2], lng: c[3] };
  }
  return null;
}

function parseTarget(raw) {
  raw = String(raw).trim();
  if (!raw) return null;
  // 直接写经纬度："48.8566,2.3522"（支持中文逗号）
  var m = raw.match(/^(-?\d+(?:\.\d+)?)\s*[,，]\s*(-?\d+(?:\.\d+)?)$/);
  if (m) {
    var lat = parseFloat(m[1]);
    var lng = parseFloat(m[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat: lat, lng: lng };
    }
    return null;
  }
  return findCity(raw);
}

function rewriteUrl(url, lat, lng) {
  return url
    .replace(/([?&])(latitude|lat)=[^&]*/gi, "$1$2=" + lat)
    .replace(/([?&])(longitude|lng|lon)=[^&]*/gi, "$1$2=" + lng);
}

(function main() {
  try {
    var target = parseTarget(readRawCity());
    if (!target) return $done({});
    var url = ($request && $request.url) || "";
    if (!url) return $done({});
    var newUrl = rewriteUrl(url, target.lat, target.lng);
    if (newUrl === url) return $done({});
    return $done({ url: newUrl });
  } catch (e) {
    return $done({});
  }
})();
