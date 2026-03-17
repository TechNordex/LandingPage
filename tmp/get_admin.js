
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres' });
client.connect()
    .then(() => client.query("SELECT email FROM portal_users WHERE role = 'admin' LIMIT 1;"))
    .then(res => { 
        console.log(res.rows[0] ? res.rows[0].email : 'NO ADMIN FOUND'); 
        client.end(); 
    })
    .catch(err => { 
        console.error(err); 
        process.exit(1); 
    });
