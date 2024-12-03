const { Pool } = require('pg');

// Configure the connection pool
const db = new Pool({
  user: 'postgres',       // PostgreSQL username
  host: 'localhost',           // Hostname (use 'localhost' or your server's IP address)
  database: 'test',   // Name of the database
  password: 'qwerty',   // Password for the user
  port: 5432,                  // PostgreSQL port (default: 5432)
});

// Export the pool for use in your app
const pool = async ()=>{
    return await db.connect().then(()=>{
        console.log("✅SQL db connected successfully!");
   }).catch(()=>{
    console.error("❌ Failed to connect to the SQL db. Error:", error.message);

   })
 }
//  db.query('Select * from houses',(err,res)=>{
//     if(!err){
//         console.log(res.rows)
//     }else{
//         console.log(err.message)
//     }
//     db.end
//  })
module.exports = {pool,db};
