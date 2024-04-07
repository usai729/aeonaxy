const jwt = require("jsonwebtoken");

exports.jwtVerification = async (req, res, next) => {
	const { token } = req.headers;

	if (!token || !token.startsWith("Bearer ")) {
		return res.status(400).json({ msg: "err/invalid-token-format" });
	}

	try {
		const existsInTokens = await req.client.query(
			`SELECT * FROM expiring_tokens WHERE token='${
				token.split(" ")[1]
			}'`,
		);

		if (existsInTokens.rowCount != 0) {
			return res.status(401).json({ msg: "err/expired-or-used-token" });
		}

		const verifiedToken = jwt.verify(
			token.split(" ")[1],
			process.env.JWT_SECRET,
		);

		if (!verifiedToken) {
			return res
				.status(401)
				.json({ msg: "err/expired-or-invalid-token" });
		}

		req.userData = verifiedToken;

		next();
	} catch (e) {
		console.error(e);

		return res.status(500).json({
			msg: "err/internal-server-error",
			loc: "token-verification",
		});
	}
};
