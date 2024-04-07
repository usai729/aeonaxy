const { Client } = require("pg");
require("dotenv").config();

const client = new Client(process.env.DATABASE_URL);

const conn = async () => {
	try {
		await client.connect();
		console.log("Database connected");
	} catch (err) {
		console.error(`Error connecting to database: ${err}`);
	}
};

module.exports = {
	conn: conn,
	client: client,
};
