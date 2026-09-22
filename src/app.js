const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const importRoutes = require('./routes/importRoutes');
const policyRoutes = require('./routes/policyRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./middleware/errors');
const { getConfig } = require('./config/env');
const { sendSuccess } = require('./utils/apiResponse');

function createApp(config = getConfig()) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(morgan(config.logFormat));
  app.use(express.json({ limit: '100kb' }));
  app.get('/health', (_req, res) => sendSuccess(res, {
    message: 'Service is healthy',
    data: { status: 'ok', uptimeSeconds: Math.floor(process.uptime()) }
  }));
  app.use('/api/import', importRoutes);
  app.use('/api/policies', policyRoutes);
  app.use('/api/messages', messageRoutes);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
