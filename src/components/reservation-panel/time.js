/**
 * 验证时间格式
 * @param {string} timeStr - 时间字符串，格式为 HH:mm
 * @returns {boolean} - 是否符合 HH:mm 格式
 */
function validateTimeFormat(timeStr) {
  const regex = /^((0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])|24:00)$/;
  return regex.test(timeStr);
}

/**
 * 生成时间段列表（不包含结束时间）
 * @param {string} startTime - 开始时间，格式为 HH:mm
 * @param {string} endTime - 结束时间，格式为 HH:mm
 * @param {number} interval - 时间间隔（分钟）
 * @returns {string[]} - 生成的时间段列表（不包含结束时间）
 */
export function generateTimeSlots(startTime, endTime, interval) {
  // 验证时间格式
  if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
    throw new Error('时间格式错误，请使用 HH:mm 格式（如 08:30）');
  }

  const toMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const toTimeString = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60)
      .toString()
      .padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);

  // 验证输入有效性
  if (startMinutes >= endMinutes || interval <= 0) {
    return [];
  }

  const timeSlots = [];
  let currentMinutes = startMinutes;

  // 修改循环条件：只包含小于结束时间的时间点
  while (currentMinutes < endMinutes) {
    timeSlots.push(toTimeString(currentMinutes));
    currentMinutes += interval;
  }

  return timeSlots;
}

/**
 * 将时间列表按小时分组并返回数组
 * @param {string[]} timeList - 时间字符串数组（格式：HH:mm）
 * @returns {Array} 按小时分组的数组，每个元素为 { hour: 小时, times: 该小时的时间数组 }
 */
export function groupTimesByHour(timeList) {
  // 验证输入是否为非空数组
  if (!Array.isArray(timeList)) {
    throw new Error('输入必须是一个数组');
  }

  // 使用对象临时存储分组
  const grouped = {};
  const startIndexMap = {};

  timeList.forEach((time, index) => {
    // 验证时间格式
    if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      throw new Error(`无效的时间格式: ${time}，请使用 HH:mm 格式`);
    }

    // 提取小时部分
    const hour = time.split(':')[0];

    // 初始化该小时的分组（如果不存在）
    if (!grouped[hour]) {
      grouped[hour] = [];
    }

    // 将时间添加到对应小时的分组
    grouped[hour].push(time);

    if (grouped[hour].length === 1) {
      startIndexMap[hour] = index; // 记录该小时的起始索引
    }
  });

  // 将对象转换为数组并排序
  return Object.keys(grouped)
    .sort((a, b) => parseInt(a) - parseInt(b)) // 按小时数值升序排序
    .map((hour) => ({
      hour: hour,
      startIndex: startIndexMap[hour],
      times: grouped[hour],
    }));
}

/**
 * 计算两个 HH:mm 格式时间之间的分钟差
 * @param {string} start - 开始时间，格式 HH:mm
 * @param {string} end   - 结束时间，格式 HH:mm
 * @returns {number}     - 相差的分钟数（始终为非负整数）
 */
export function getMinutesDiff(start, end) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);

  const totalStart = sh * 60 + sm;
  const totalEnd = eh * 60 + em;

  const diff = totalEnd >= totalStart ? totalEnd - totalStart : totalEnd + 24 * 60 - totalStart;

  return diff;
}

/**
 * 在给定时间基础上增加若干分钟，返回新的 HH:mm 格式时间
 * @param {string} timeStr - 开始时间，格式 HH:mm
 * @param {number} minutes - 要增加的分钟数（可正可负）
 * @returns {string}       - 新的时间，格式 HH:mm，始终落在 00:00–23:59
 */
export function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);

  const total = (((h * 60 + m + minutes) % (24 * 60)) + 24 * 60) % (24 * 60);

  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');

  return `${hh}:${mm}`;
}

/**
 * 判断两个 HH:mm 格式时间的大小关系
 * @param {string} t1 - 时间1
 * @param {string} t2 - 时间2
 * @returns {number}  -  t1 < t2 返回 -1
 *                      t1 = t2 返回  0
 *                      t1 > t2 返回  1
 */
export function compareTime(t1, t2) {
  const toMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const m1 = toMinutes(t1);
  const m2 = toMinutes(t2);
  return m1 < m2 ? -1 : m1 > m2 ? 1 : 0;
}

/**
 * 将 HH:mm 格式时间转换为总分钟数
 * @param {string} timeStr - HH:mm 格式时间
 * @returns
 */
export function toMinutes(timeStr) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
