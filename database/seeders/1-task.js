
exports.seed = function(knex) {
    return knex('tasks').del()
        .then(function () {
            return knex('tasks').insert([
                {
                    id: 1,
                    user_id: 1,
                    location: 'Danau Lake',
                    day: new Date(2020, 9, 18),
                },
                {
                    id: 2,
                    user_id: 1,
                    location: 'My Lovely School',
                    day: new Date(2020, 9, 18),
                    start_at: new Date(2020, 9, 18, 8, 0, 0),
                    end_at: new Date(2020, 9, 18, 13, 0, 0)
                }
            ]);
        });
};
