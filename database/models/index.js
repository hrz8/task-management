const fs = require('fs');
const path = require('path');
const Objection = require('objection');
const Knex = require('knex');
const { Model, knexSnakeCaseMappers } = Objection;

const { db } = require('../../app.config')[process.env.NODE_ENV || 'development'];

const { host, port, user, password, name: database, timezone } = db;
const knexConfig = {
    client: 'mysql2',
    connection: {
        host, port, user, password,
        database, timezone
    },
    migrations: {
        tableName: 'knex_migrations',
        directory: './database/migrations'
    },
    seeds: {
        directory: './database/seeders'
    }
};

const knex = Knex(Object.assign(knexConfig, knexSnakeCaseMappers()));
Model.knex(knex);

const models = {};

fs.readdirSync(__dirname)
    .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js'))
    .forEach((file) => {
        const mod = path.join(__dirname, file);
        const model = require(mod)(Model);
        models[model.name] = model;
    });

const transaction = {
    start: async () => await Objection.transaction.start(knex)
};

module.exports = {
    transaction, Model, ...models
};