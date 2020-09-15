const bcrypt = require('bcryptjs');

exports.seed = function(knex) {
    return knex('users').del()
        .then(function () {
            return knex('users').insert([
                {
                    username: 'ali1999',
                    full_name: 'Ali Ridho Francisco',
                    password: bcrypt.hashSync('password', 8)
                },
                {
                    username: 'barikmhd',
                    full_name: 'Muhammad Barik',
                    password: bcrypt.hashSync('password', 8)
                },
                {
                    username: 'akurandom_vito',
                    full_name: 'Charles Avito',
                    password: bcrypt.hashSync('password', 8)
                },
                {
                    username: 'bybycaca',
                    full_name: 'Byanca Faras',
                    password: bcrypt.hashSync('password', 8)
                },
                {
                    username: 'xxxenak',
                    full_name: 'Xena Abdullah',
                    password: bcrypt.hashSync('password', 8)
                }
            ]);
        });
};
