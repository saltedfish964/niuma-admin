/**
 * 检查对象是否缺少指定字段
 * @param {object} obj
 * @param {string[]} requiredFields
 * @returns
 */
export function checkMissingFields(obj, requiredFields) {
  const objKeys = Object.keys(obj);
  return requiredFields.filter((field) => !objKeys.includes(field));
}
