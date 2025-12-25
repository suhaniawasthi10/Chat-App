module.exports = {
    apps: [
        {
            name: 'chatapp-backend',
            cwd: '/var/www/html/Chat-App/backend',
            script: 'dist/server.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '500M',
            env: {
                NODE_ENV: 'production',
                PORT: 5000
            },
            error_file: '/var/log/pm2/chatapp-backend-error.log',
            out_file: '/var/log/pm2/chatapp-backend-out.log',
            log_file: '/var/log/pm2/chatapp-backend-combined.log',
            time: true
        },
        {
            name: 'chatapp-frontend',
            cwd: '/var/www/html/Chat-App/frontend',
            script: 'node_modules/.bin/vite',
            args: 'preview --host 0.0.0.0 --port 3000',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '300M',
            env: {
                NODE_ENV: 'production'
            },
            error_file: '/var/log/pm2/chatapp-frontend-error.log',
            out_file: '/var/log/pm2/chatapp-frontend-out.log',
            log_file: '/var/log/pm2/chatapp-frontend-combined.log',
            time: true
        }
    ]
};
