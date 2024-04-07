const jwt = require("jsonwebtoken");
require("dotenv").config();

function genToken(email, name) {
	const token = jwt.sign(
		{ email: email, name: name },
		process.env.JWT_SECRET,
		{
			expiresIn: "1d",
		},
	);

	return token;
}

module.exports = genToken;
