const sql = require('mssql');

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  server: `${process.env.DB_HOST}`,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: true, // for azure
    trustServerCertificate: false // change to true for local dev / self-signed certs
  }
};

module.exports = {
	sqlConfig : sqlConfig,

	async testConnection() {
		try {
		 // make sure that any items are correctly URL encoded in the connection string
		 await sql.connect(sqlConfig);
		 console.log('Successfully Connected to Database.');
		} catch (err) {
		 console.log('Failed to Connect to Database.');
		 console.log(err);
		}
	}
};