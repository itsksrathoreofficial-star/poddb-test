// PodDB 3.0 - PM2 Production Configuration for cPanel

module.exports = {
  apps: [
    {
      name: 'poddb-main',
      script: 'npm',
      args: 'start',
      cwd: process.env.HOME + '/public_html',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: process.env.HOME + '/logs/poddb-main-error.log',
      out_file: process.env.HOME + '/logs/poddb-main-out.log',
      log_file: process.env.HOME + '/logs/poddb-main-combined.log',
      time: true
    },
    {
      name: 'poddb-sync-server',
      script: 'server.js',
      cwd: process.env.HOME + '/sync-server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        SYNC_SERVER_PORT: 3002
      },
      error_file: process.env.HOME + '/logs/poddb-sync-error.log',
      out_file: process.env.HOME + '/logs/poddb-sync-out.log',
      log_file: process.env.HOME + '/logs/poddb-sync-combined.log',
      time: true
    }
  ],

  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/poddb.git',
      path: '/var/www/production',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
