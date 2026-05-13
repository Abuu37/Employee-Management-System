import { sequelize } from './config/db.js';

try {
  const [rows] = await sequelize.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'notifications' ORDER BY ordinal_position"
  );
  console.log(rows);
} catch (e) {
  console.error(e);
}

process.exit(0);
