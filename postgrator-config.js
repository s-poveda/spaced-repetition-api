require('dotenv').config();
console.log(process.env.DATABASE_URL);
module.exports = {
  migrationDirectory: 'migrations',
  driver: 'pg',
	connectionString: process.env.DATABASE_URL,
};
