/**
 * 验证时间格式
 * @param {string} timeStr - 时间字符串，格式为 HH:mm
 * @returns {boolean} - 是否符合 HH:mm 格式
 */
function validateTimeFormat(timeStr) {
  const regex = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
  return regex.test(timeStr);
}

/**
 * 生成时间段列表
 * @param {string} startTime - 开始时间，格式为 HH:mm
 * @param {string} endTime - 结束时间，格式为 HH:mm
 * @param {number} interval - 时间间隔（分钟）
 * @returns {string[]} - 生成的时间段列表
 */
export function generateTimeSlots(startTime, endTime, interval) {
  // 验证时间格式
  if (!validateTimeFormat(startTime) || !validateTimeFormat(endTime)) {
    throw new Error('时间格式错误，请使用 HH:mm 格式（如 08:30）');
  }

  // 将时间字符串转换为分钟数
  const toMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 将分钟数转换回时间字符串
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

  // 生成时间列表
  while (currentMinutes <= endMinutes) {
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

  timeList.forEach((time) => {
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
  });

  // 将对象转换为数组并排序
  return Object.keys(grouped)
    .sort((a, b) => parseInt(a) - parseInt(b)) // 按小时数值升序排序
    .map((hour) => ({
      hour: hour,
      times: grouped[hour],
    }));
}
