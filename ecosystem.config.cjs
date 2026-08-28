module.exports = {
  apps: [
    {
      name: 'wargahub',
      script: './prod-server.mjs',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 4321,
      },
    },
  ],
};
