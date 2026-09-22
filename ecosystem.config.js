module.exports = {
  apps: [
    {
      name: 'policy-api',
      script: 'src/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      exp_backoff_restart_delay: 100,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
