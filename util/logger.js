exports.log = (object) => {
  process.env.ENABLE_DEBUG == "true" ? console.log(object) : null;
};
exports.debug = (object) => {
  process.env.ENABLE_DEBUG == "true" ? console.debug(object) : null;
};
exports.info = (object) => {
  process.env.ENABLE_DEBUG == "true" ? console.info(object) : null;
};
exports.warn = (object) => {
  process.env.ENABLE_DEBUG == "true" ? console.warn(object) : null;
};
exports.error = (object) => {
  process.env.ENABLE_DEBUG == "true" ? console.error(object) : null;
};
exports.table = (object) => {
  process.env.ENABLE_DEBUG == "true" ? console.table(object) : null;
};
exports.group = (object) => {
  process.env.ENABLE_DEBUG == "true" ? console.group(object) : null;
};
exports.groupCollapsed = (object) => {
  process.env.ENABLE_DEBUG == "true" ? console.groupCollapsed(object) : null;
};
exports.groupEnd = (object) => {
  process.env.ENABLE_DEBUG == "true" ? console.groupEnd(object) : null;
};
