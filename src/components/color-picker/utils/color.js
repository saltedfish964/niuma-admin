const { min, max, floor, round } = Math;

/**
 * 尝试将颜色名称转换为 rgb/a 十六进制表示
 * @param name
 * @returns {string | CanvasGradient | CanvasPattern}
 */
function standardizeColor(name) {
  if (name.toLowerCase() === 'black') {
    return '#000';
  }

  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = name;
  return ctx.fillStyle === '#000' ? null : ctx.fillStyle;
}

/**
 * 将 HSV 频谱转换为 RGB
 * @param h Hue
 * @param s Saturation
 * @param v Value
 * @returns {number[]} Array with rgb values.
 */
export function hsvToRgb(h, s, v) {
  h = (h / 360) * 6;
  s /= 100;
  v /= 100;

  const i = floor(h);

  const f = h - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  const mod = i % 6;
  const r = [v, q, p, p, t, v][mod];
  const g = [t, v, v, q, p, p][mod];
  const b = [p, p, t, v, v, q][mod];

  return [r * 255, g * 255, b * 255];
}

/**
 * 转换 HSV 频谱到十六进制
 * @param h Hue
 * @param s Saturation
 * @param v Value
 * @returns {string[]} Hex values
 */
export function hsvToHex(h, s, v) {
  return hsvToRgb(h, s, v).map((v) => round(v).toString(16).padStart(2, '0'));
}

/**
 * 将 HSV 频谱转换为 CMYK.
 * @param h Hue
 * @param s Saturation
 * @param v Value
 * @returns {number[]} CMYK values
 */
export function hsvToCmyk(h, s, v) {
  const rgb = hsvToRgb(h, s, v);
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;

  const k = min(1 - r, 1 - g, 1 - b);
  const c = k === 1 ? 0 : (1 - r - k) / (1 - k);
  const m = k === 1 ? 0 : (1 - g - k) / (1 - k);
  const y = k === 1 ? 0 : (1 - b - k) / (1 - k);

  return [c * 100, m * 100, y * 100, k * 100];
}

/**
 * 将 HSV 频谱转换为 HSL.
 * @param h Hue
 * @param s Saturation
 * @param v Value
 * @returns {number[]} HSL values
 */
export function hsvToHsl(h, s, v) {
  s /= 100;
  v /= 100;

  const l = ((2 - s) * v) / 2;

  if (l !== 0) {
    if (l === 1) {
      s = 0;
    } else if (l < 0.5) {
      s = (s * v) / (l * 2);
    } else {
      s = (s * v) / (2 - l * 2);
    }
  }

  return [h, s * 100, l * 100];
}

/**
 * 将 RGB 转换为 HSV
 * @param r Red
 * @param g Green
 * @param b Blue
 * @return {number[]} HSV values.
 */
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const minVal = min(r, g, b);
  const maxVal = max(r, g, b);
  const delta = maxVal - minVal;

  let h, s;
  const v = maxVal;
  if (delta === 0) {
    h = s = 0;
  } else {
    s = delta / maxVal;
    const dr = ((maxVal - r) / 6 + delta / 2) / delta;
    const dg = ((maxVal - g) / 6 + delta / 2) / delta;
    const db = ((maxVal - b) / 6 + delta / 2) / delta;

    if (r === maxVal) {
      h = db - dg;
    } else if (g === maxVal) {
      h = 1 / 3 + dr - db;
    } else if (b === maxVal) {
      h = 2 / 3 + dg - dr;
    }

    if (h < 0) {
      h += 1;
    } else if (h > 1) {
      h -= 1;
    }
  }

  return [h * 360, s * 100, v * 100];
}

/**
 * 将 CMYK 转换为 HSV
 * @param c Cyan
 * @param m Magenta
 * @param y Yellow
 * @param k Key (Black)
 * @return {number[]} HSV values.
 */
function cmykToHsv(c, m, y, k) {
  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;

  const r = (1 - min(1, c * (1 - k) + k)) * 255;
  const g = (1 - min(1, m * (1 - k) + k)) * 255;
  const b = (1 - min(1, y * (1 - k) + k)) * 255;

  return [...rgbToHsv(r, g, b)];
}

/**
 * 将 HSL 转换为 HSV
 * @param h Hue
 * @param s Saturation
 * @param l Lightness
 * @return {number[]} HSV values.
 */
function hslToHsv(h, s, l) {
  s /= 100;
  l /= 100;
  s *= l < 0.5 ? l : 1 - l;

  const ns = ((2 * s) / (l + s)) * 100;
  const v = (l + s) * 100;
  return [h, isNaN(ns) ? 0 : ns, v];
}

/**
 * 将 HEX 转换为 HSV
 * @param hex 十六进制字符串的 rgb 颜色，可以是 3 或 6 的长度
 * @return {number[]} HSV values.
 */
function hexToHsv(hex) {
  return rgbToHsv(...hex.match(/.{2}/g).map((v) => parseInt(v, 16)));
}

/**
 * 尝试将字符串解析为 HSV 数组
 * 当前支持的类型有 cmyk、rgba、hsla 和十六进制
 * @param str
 * @return {*}
 */
export function parseToHSVA(str) {
  // 检查字符串是否为颜色名称
  str = str.match(/^[a-zA-Z]+$/) ? standardizeColor(str) : str;

  // 匹配不同类型的颜色表示的正则表达式
  const regex = {
    cmyk: /^cmyk\D+([\d.]+)\D+([\d.]+)\D+([\d.]+)\D+([\d.]+)/i,
    rgba: /^rgba?\D+([\d.]+)(%?)\D+([\d.]+)(%?)\D+([\d.]+)(%?)\D*?(([\d.]+)(%?)|$)/i,
    hsla: /^hsla?\D+([\d.]+)\D+([\d.]+)\D+([\d.]+)\D*?(([\d.]+)(%?)|$)/i,
    hsva: /^hsva?\D+([\d.]+)\D+([\d.]+)\D+([\d.]+)\D*?(([\d.]+)(%?)|$)/i,
    hexa: /^#?(([\dA-Fa-f]{3,4})|([\dA-Fa-f]{6})|([\dA-Fa-f]{8}))$/i,
  };

  /**
   * 接受任意类型的 Array，转换字符串表示
   * 一个数字到一个数字，其他任何东西到未定义
   * @param array
   * @return {*}
   */
  const numarize = (array) =>
    array.map((v) => (/^(|\d+)\.\d+|\d+$/.test(v) ? Number(v) : undefined));

  let match;
  invalid: for (const type in regex) {
    // Check if current scheme passed
    if (!(match = regex[type].exec(str))) {
      continue;
    }

    // Try to convert
    switch (type) {
      case 'cmyk': {
        const [, c, m, y, k] = numarize(match);

        if (c > 100 || m > 100 || y > 100 || k > 100) {
          break invalid;
        }

        return { values: cmykToHsv(c, m, y, k), type };
      }
      case 'rgba': {
        let [, r, , g, , b, , , a] = numarize(match);

        r = match[2] === '%' ? (r / 100) * 255 : r;
        g = match[4] === '%' ? (g / 100) * 255 : g;
        b = match[6] === '%' ? (b / 100) * 255 : b;
        a = match[9] === '%' ? a / 100 : a;

        if (r > 255 || g > 255 || b > 255 || a < 0 || a > 1) {
          break invalid;
        }

        return { values: [...rgbToHsv(r, g, b), a], a, type };
      }
      case 'hexa': {
        let [, hex] = match;

        if (hex.length === 4 || hex.length === 3) {
          hex = hex
            .split('')
            .map((v) => v + v)
            .join('');
        }

        const raw = hex.substring(0, 6);
        let a = hex.substring(6);

        // Convert 0 - 255 to 0 - 1 for opacity
        a = a ? parseInt(a, 16) / 255 : undefined;

        return { values: [...hexToHsv(raw), a], a, type };
      }
      case 'hsla': {
        let [, h, s, l, , a] = numarize(match);
        a = match[6] === '%' ? a / 100 : a;

        if (h > 360 || s > 100 || l > 100 || a < 0 || a > 1) {
          break invalid;
        }

        return { values: [...hslToHsv(h, s, l), a], a, type };
      }
      case 'hsva': {
        let [, h, s, v, , a] = numarize(match);
        a = match[6] === '%' ? a / 100 : a;

        if (h > 360 || s > 100 || v > 100 || a < 0 || a > 1) {
          break invalid;
        }

        return { values: [h, s, v, a], a, type };
      }
    }
  }

  return { values: null, type: null };
}
