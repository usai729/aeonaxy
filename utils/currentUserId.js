const currentUserId = async (req, email) => {
	try {
		const query = await req.client.query(
			`SELECT * FROM "user" WHERE email=$1`,
			[email],
		);

		return query.rows[0].id;
	} catch (e) {
		throw new Error(e);
	}
};

module.exports = currentUserId;
