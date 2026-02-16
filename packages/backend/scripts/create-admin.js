const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

async function createAdmin() {

  const connectionString = process.env.DATABASE_URL;
  const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

  if (!connectionString || connectionString === '') {
    throw new Error('Connection string not found');
  }

  if (!adminEmail || adminEmail === '') {
    throw new Error('Admin email not found');
  }

  if (!adminPassword || adminPassword === '') {
    throw new Error('Admin password not found');
  }

  const pool = new Pool({
    connectionString
  });

  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Insert or update admin user
    const result = await pool.query(`
      INSERT INTO users (email, password_hash, role) 
      VALUES ($1, $2, 'admin')
      ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        role = 'admin',
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, role
    `, [adminEmail, hashedPassword]);

    console.log('✅ Admin user created/updated:', result.rows[0]);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('🚀 Ready for deployment!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  createAdmin();
}

module.exports = { createAdmin };