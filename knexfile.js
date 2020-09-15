const { db } = require('./app.config')[process.env.NODE_ENV || 'development'];
const { host, port, user, password, name: database, timezone } = db;

const conf = {
    client: 'mysql2',
    connection: {
        host, port, user, password,
        database, timezone
    },
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        tableName: 'knex_migrations',
        directory: './database/migrations'
    },
    seeds: {
        directory: './database/seeders'
    }
};

module.exports = {
    development: conf,
    staging: conf,
    production: conf
};
