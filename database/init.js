const mysql = require('mysql2');
const { db } = require('../app.config')[process.env.NODE_ENV || 'development'];

const { host, port, user, password } = db;
const con = mysql.createConnection({
    host, port, user, password
});

if (process.argv[2] === 'create') {
    con.connect((err) => {
        if (err) throw err;
        con.query(`CREATE DATABASE IF NOT EXISTS ${db.name}`, (error, result) => {
            if (error) throw error;
            console.log('Database created!');
            con.end();
        });
    });
}

if (process.argv[2] === 'drop') {
    con.connect((err) => {
        if (err) throw err;
        con.query(`DROP DATABASE IF EXISTS ${db.name}`, (error, result) => {
            if (error) throw error;
            console.log('Database dropped!');
            con.end();
        });
    });
}
