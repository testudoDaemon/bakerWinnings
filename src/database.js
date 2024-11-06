const mysql = require('mysql');
const { promisify } = require('util');
const { database } = require('./keys');

const pool = mysql.createPool(database);

pool.getConnection((err, connection) => {
    if (err) {
        let errorMessage = '';
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            errorMessage = 'DATABASE CONNECTION WAS CLOSED';
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            errorMessage = 'DATABASE HAS TOO MANY CONNECTIONS';
        }
        if (err.code === 'ECONNREFUSED') {
            errorMessage = 'DATABASE CONNECTION WAS REFUSED';
        }
        if (err.code === 'ECONNRESET') {
            errorMessage = 'DATABASE CONNECTION WAS RESET';
        }

        console.error(errorMessage);
        return;
    }

    if (connection) connection.release();
    console.log('DB is connected');
    return;
});

// Promisify Pool Queries
pool.query = promisify(pool.query);

module.exports = pool;