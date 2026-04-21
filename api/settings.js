const { Pool } = require('pg');

const DATABASE_URL = "postgresql://neondb_owner:npg_WeBqunU56xPX@ep-lucky-cloud-aozli1uh.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ connectionString: DATABASE_URL });

export default async function handler(req, res) {
  try {
    // Create a simple settings table if it doesn't exist
    await pool.query(`CREATE TABLE IF NOT EXISTS app_settings (setting_key VARCHAR(50) PRIMARY KEY, setting_value NUMERIC(12, 2));`);

    if (req.method === 'GET') {
      const { rows } = await pool.query(`SELECT setting_value FROM app_settings WHERE setting_key = 'advance'`);
      return res.status(200).json({ advance: rows.length > 0 ? parseFloat(rows[0].setting_value) : 0 });
    } 
    else if (req.method === 'POST') {
      const { advance } = req.body;
      await pool.query(`
        INSERT INTO app_settings (setting_key, setting_value) VALUES ('advance', $1) 
        ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value
      `, [advance]);
      return res.status(200).json({ success: true });
    }
    
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
}
