const mysql = require('mysql2/promise');

// Create a connection pool
const cPanelDb = mysql.createPool({
    host: '10.10.10.10',
    user: 'yxdgljyk_omda',
    password: 'Imed.nass123456',
    database: 'yxdgljyk_houseBookDB',
    port: 3306,
    ssl: {
        rejectUnauthorized: false // Set to true if you have a valid certificate
    }
});
 
// Export the pool to use in other parts of your app
module.exports = cPanelDb;