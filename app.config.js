module.exports = {
    namespace: 'todo',
    development: {
        transport: 'nats://localhost:4222',
        db: {
            host: process.env.DB_HOST || '127.0.0.1',
            port: 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'toor',
            name: 'task_management',
            timezone: '+00:00',
        },
        jwt: {
            secret: 'JhGTbHlBjCROUCOL3V4hK3c3P5PeOM4gdB37n5y2',
            expiresIn: '3d'
        }
    },
};