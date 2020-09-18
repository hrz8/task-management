
exports.seed = function(knex) {
    return knex('task_lists').del()
        .then(function () {
            return knex('task_lists').insert([
                {
                    task_id: 1,
                    description: 'Just taking a breath',
                },
                {
                    task_id: 1,
                    description: 'Taking more and more picture',
                },
                {
                    task_id: 1,
                    description: 'Swimming and jogging (?) HAHA!',
                },
                {
                    task_id: 2,
                    description: 'Math Exam',
                    start_at: new Date(2020, 9, 18, 8, 0, 0),
                    end_at: new Date(2020, 9, 18, 10, 0, 0)
                },
                {
                    task_id: 2,
                    description: 'Science Exam',
                    start_at: new Date(2020, 9, 18, 10, 0, 0),
                    end_at: new Date(2020, 9, 18, 12, 0, 0)
                },
                {
                    task_id: 2,
                    description: 'English Exam',
                    start_at: new Date(2020, 9, 18, 12, 0, 0),
                    end_at: new Date(2020, 9, 18, 13, 0, 0)
                }
            ]);
        });
};
