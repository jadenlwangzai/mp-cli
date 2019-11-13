module.exports = function handleConfigToCrossEnv(config) {
  return Object.entries(config)
    .map(([key, val]) => `cross-env ${key}=${val}`)
    .join(' ');
};
