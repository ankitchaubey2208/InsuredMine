const os = require('node:os');

function snapshot() {
  return os.cpus().reduce((sum, cpu) => {
    const times = cpu.times;
    sum.idle += times.idle;
    sum.total += times.user + times.nice + times.sys + times.idle + times.irq;
    return sum;
  }, { idle: 0, total: 0 });
}

function utilization(previous, current) {
  const totalDelta = current.total - previous.total;
  const idleDelta = current.idle - previous.idle;
  if (totalDelta <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (1 - idleDelta / totalDelta) * 100));
}

function startCpuMonitor({ threshold = 70, intervalMs = 5000, onThreshold } = {}) {
  let previous = snapshot();
  let thresholdReached = false;
  const timer = setInterval(() => {
    const current = snapshot();
    const percent = utilization(previous, current);
    previous = current;
    console.info(`[cpu] ${percent.toFixed(1)}%`);
    if (!thresholdReached && percent >= threshold) {
      thresholdReached = true;
      console.error(`[cpu] threshold ${threshold}% reached; requesting supervised restart`);
      clearInterval(timer);
      if (onThreshold) {
        onThreshold(percent);
      } else {
        process.kill(process.pid, 'SIGTERM');
      }
    }
  }, intervalMs);
  timer.unref();
  return () => clearInterval(timer);
}

module.exports = { snapshot, utilization, startCpuMonitor };
