const path = require('node:path');
const { Worker } = require('node:worker_threads');

function importFileInWorker(filePath, mongoUri) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, '../workers/import.worker.js'), {
      workerData: { filePath, mongoUri }
    });
    let settled = false;
    worker.once('message', (message) => {
      settled = true;
      if (message.ok) {
        resolve(message.summary);
      } else {
        reject(new Error(message.error));
      }
    });
    worker.once('error', (error) => {
      settled = true;
      reject(error);
    });
    worker.once('exit', (code) => {
      if (!settled) {
        reject(new Error(code === 0
          ? 'Import worker exited before returning a result'
          : `Import worker exited with code ${code}`));
      }
    });
  });
}

module.exports = { importFileInWorker };
