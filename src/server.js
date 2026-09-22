require('dotenv').config();
const http = require('node:http');
const { createApp } = require('./app');
const { getConfig } = require('./config/env');
const { connectDatabase, disconnectDatabase } = require('./config/db');
const { startCpuMonitor } = require('./services/cpuMonitor');
const { startMessageScheduler } = require('./services/messageScheduler');

async function start() {
  const config = getConfig();
  await connectDatabase(config.mongoUri);
  const server = http.createServer(createApp(config));
  server.listen(config.port, () => console.info(`Policy API listening on port ${config.port}`));

  let shuttingDown = false;
  const stopScheduler = startMessageScheduler(config.messageSchedulerIntervalMs);
  const stopCpuMonitor = startCpuMonitor({
    threshold: config.cpuRestartThreshold,
    intervalMs: config.cpuSampleIntervalMs,
    onThreshold: () => shutdown('CPU_THRESHOLD', 1)
  });

  function shutdown(reason, exitCode = 0) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    console.info(`${reason} received; shutting down`);
    stopScheduler();
    stopCpuMonitor();
    server.close(async () => {
      await disconnectDatabase().catch(console.error);
      process.exit(exitCode);
    });

    // Do not leave a stuck connection open forever during deployment shutdown.
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('Unable to start server', error);
  process.exit(1);
});
