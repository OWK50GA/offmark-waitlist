const fs = require('fs'); 
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("Connection string not found");
}

const pool = new Pool({
    connectionString
});

fs.readdir('./migrations', (err, files) => { 
    if (err) throw err;
    
    files.sort().forEach(file => { 
        if (file.endsWith('.sql')) { 
            const sql = fs.readFileSync('./migrations/' + file, 'utf8'); 
            pool.query(sql)
                .then(() => console.log('✅ Executed:', file))
                .catch(console.error); 
        }
    })
});