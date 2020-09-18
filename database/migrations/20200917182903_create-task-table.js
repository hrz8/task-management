
exports.up = function(knex) {
    return knex.schema.createTable('tasks', (table) => {
        table.increments();
        table.integer('user_id')
            .unsigned()
            .notNullable();
        table.string('location')
            .nullable();
        table.datetime('day')
            .notNullable()
            .index();
        table.datetime('start_at')
            .index();
        table.datetime('end_at')
            .index();
        table.timestamps(true, true);

        table.foreign(['user_id'])
            .references('users.id')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('tasks');
};
