const bcrypt = require('bcryptjs');

exports.seed = function(knex) {
    return knex('users').del()
        .then(function () {
            return knex('users').insert([
                {
                    id: 1,
                    username: 'ali1999',
                    full_name: 'Ali Ridho Francisco',
                    password: bcrypt.hashSync('12345678', 8)
                },
                {
                    id: 2,
                    username: 'barikmhd',
                    full_name: 'Muhammad Barik',
                    password: bcrypt.hashSync('12345678', 8)
                },
                {
                    id: 3,
                    username: 'akurandom_vito',
                    full_name: 'Charles Avito',
                    password: bcrypt.hashSync('12345678', 8)
                },
                {
                    id: 4,
                    username: 'bybycaca',
                    full_name: 'Byanca Faras',
                    password: bcrypt.hashSync('12345678', 8)
                },
                {
                    id: 5,
                    username: 'xxxenak',
                    full_name: 'Xena Abdullah',
                    password: bcrypt.hashSync('12345678', 8)
                }
            ]);
        });
};
