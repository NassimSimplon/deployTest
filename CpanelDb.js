const mysql = require('mysql2/promise.js');

// Create a connection pool
const cPanelDb = mysql.createPool({
    host: '10.10.10.10',
    user: 'yxdgljyk_yxdgljyk',
    password: 'Imed.nass123456',
    database: 'yxdgljyk_houseBook',
    port: 3306,
    // waitForConnections: true,
    // connectionLimit: 10,
    // queueLimit: 0,
    // connectTimeout: 20000,
    // ssl: {
    //     rejectUnauthorized: false // Set to true if you have a valid certificate
    // }
});

// Export the pool to use in other parts of your app
module.exports = cPanelDb;