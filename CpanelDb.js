const mysql = require('mysql2/promise.js');

// Create a connection pool
const cPanelDb = mysql.createPool({
    host: 'localhost',
    user: 'yxdgljyk_omda',
    password: 'Imed.nass123456',
    database: 'yxdgljyk_houseBookDB',
    port: 3306,
    // waitForConnections: true,
    // connectionLimit: 10,
    // queueLimit: 0,
    // connectTimeout: 20000,
    ssl: {
        rejectUnauthorized: false // Set to true if you have a valid certificate
    }
});
 
// Export the pool to use in other parts of your app
module.exports = cPanelDb;