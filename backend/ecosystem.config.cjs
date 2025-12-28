module.exports = {
  apps: [
    {
      name: 'a7-backend',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 7500,
        CORS_ORIGIN: 'http://localhost:3401',
        DATABASE_URL: 'postgresql://a7:a7password@127.0.0.1:5432/a7_restaurant',
        JWT_SECRET: 'change-me-please-change-me-please'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 7500,
        // IMPORTANT:
        // Do NOT hardcode secrets in git. Set these on the server environment instead:
        // - DATABASE_URL
        // - JWT_SECRET
        // - CORS_ORIGIN
      }
    }
  ]
};


