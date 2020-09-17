
exports.up = function(knex) {
    return knex.schema.createTable('sessions', (table) => {
        table.increments();
        table.text('token')
            .notNullable();
        table.integer('user_id')
            .unsigned()
            .notNullable();
        table.datetime('expired')
            .index();
        table.timestamps(true, true);

        table.foreign(['user_id'])
            .references('users.id')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('sessions');
};
