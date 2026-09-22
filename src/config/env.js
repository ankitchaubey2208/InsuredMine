const DEFAULTS = {
  port: 3000,
  cpuRestartThreshold: 70,
  cpuSampleIntervalMs: 5000,
  messageSchedulerIntervalMs: 1000,
  maxUploadMb: 25,
  logFormat: 'dev'
};

function numberFromEnv(name, fallback, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  const rawValue = process.env[name];
  if (rawValue === undefined || rawValue === '') {
    return fallback;
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${name} must be a number between ${min} and ${max}`);
  }
  return value;
}

function getConfig() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: numberFromEnv('PORT', DEFAULTS.port, { min: 1, max: 65535 }),
    mongoUri: process.env.MONGODB_URI,
    cpuRestartThreshold: numberFromEnv(
      'CPU_RESTART_THRESHOLD',
      DEFAULTS.cpuRestartThreshold,
      { min: 1, max: 100 }
    ),
    cpuSampleIntervalMs: numberFromEnv(
      'CPU_SAMPLE_INTERVAL_MS',
      DEFAULTS.cpuSampleIntervalMs,
      { min: 250 }
    ),
    messageSchedulerIntervalMs: numberFromEnv(
      'MESSAGE_SCHEDULER_INTERVAL_MS',
      DEFAULTS.messageSchedulerIntervalMs,
      { min: 100 }
    ),
    maxUploadMb: numberFromEnv('MAX_UPLOAD_MB', DEFAULTS.maxUploadMb, { min: 1, max: 500 }),
    logFormat: process.env.LOG_FORMAT || process.env.LOG_LEVEL || DEFAULTS.logFormat
  };
}

module.exports = { getConfig, numberFromEnv };
