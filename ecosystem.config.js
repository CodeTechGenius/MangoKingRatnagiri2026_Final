// PM2 Ecosystem Config — Mango King Ratnagiri
// Usage: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name:         'mangoking-api',
      cwd:          '/var/www/mangoking/server',
      script:       'npm',
      args:         'run dev',
      env: {
        NODE_ENV:   'production',
        PORT:       4000,
      },
      instances:    1,
      autorestart:  true,
      watch:        false,
      max_memory_restart: '512M',
      error_file:   '/var/log/mangoking-api.err.log',
      out_file:     '/var/log/mangoking-api.out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    {
      name:         'mangoking-web',
      cwd:          '/var/www/mangoking/client',
      script:       'node',
      args:         'build/index.js',
      env: {
        NODE_ENV:   'production',
        PORT:       3000,
        ORIGIN:     'https://www.mangokingratnagiri.com',
      },
      instances:    1,
      autorestart:  true,
      watch:        false,
      max_memory_restart: '256M',
      error_file:   '/var/log/mangoking-web.err.log',
      out_file:     '/var/log/mangoking-web.out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
