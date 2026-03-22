const { db } = require('./lib/db');

async function checkProjects() {
    try {
        const res = await db.query(`
            SELECT id, name, client_id, (SELECT email FROM portal_users WHERE id = client_id) as email
            FROM projects
        `);
        console.log('Projects check:');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkProjects();
