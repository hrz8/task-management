
exports.up = function(knex) {
    return knex.schema.createTable('task_lists', (table) => {
        table.increments();
        table.integer('task_id')
            .unsigned()
            .notNullable();
        table.string('description')
            .nullable();  
        table.datetime('start_at')
            .index();
        table.datetime('end_at')
            .index();
        table.timestamps(true, true);

        table.foreign(['task_id'])
            .references('tasks.id')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('task_lists');
};
