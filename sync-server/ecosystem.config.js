module.exports = {
  apps: [{
    name: 'sync-server',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    kill_timeout: 5000,
    listen_timeout: 3000,
    env: {
      NODE_ENV: 'production',
      SYNC_SERVER_PORT: 3002
    },
    env_development: {
      NODE_ENV: 'development',
      SYNC_SERVER_PORT: 3002
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    log_type: 'json'
  }]
};
