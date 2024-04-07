const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const fs = require("fs").promises;
const crypt = require("crypto");

const genToken = require("../utils/genToken");
const sendMail = require("../utils/mailer");
const path = require("path");

exports.register = async (req, res) => {
	const { email, name, password, role } = req.body;
	const profile = req.file ? req.file.filename : null;
	const errors = validationResult(req);

	if (!errors.isEmpty) {
		return res.json({ msg: "err/validation-error", errors });
	}

	try {
		const emailExistsQuery = {
			text: 'SELECT * FROM "user" WHERE email = $1',
			values: [email],
		};
		const { rows: existingUsers } = await req.client.query(
			emailExistsQuery,
		);

		if (existingUsers.length > 0) {
			return res.status(400).json({ msg: "err/email-already-exists" });
		}

		const salt = await bcrypt.genSalt();
		const hash = await bcrypt.hash(password, salt);

		var insertQuery = {
			text: 'INSERT INTO "user"(email, name, password, profile_picture) VALUES($1, $2, $3, $4)',
			values: [email, name, hash, profile],
		};

		if (role) {
			insertQuery = {
				text: 'INSERT INTO "user"(email, name, password, profile_picture, role, confirmed) VALUES($1, $2, $3, $4, $5, $6)',
				values: [email, name, hash, profile, role, true],
			};
		}

		const insert = await req.client.query(insertQuery);
		console.log(insert);

		//Send email to confirm email if user is not superadmin, i.e if role is not present
		if (!role) {
			const emailConfirmationToken = genToken(email, name);
			await sendMail(
				"Email Confirmation",
				`Click the <a href='http://localhost:3001/token=${emailConfirmationToken}'>link (https://localhost:3000/token=${emailConfirmationToken})</a> to confirm email.<br>Token: ${emailConfirmationToken}`,
				email,
			);
		}

		//User id can be used for the token instead of email and name
		const token = genToken(email, name);

		return res.status(200).json({ msg: "success/user-created", token });
	} catch (e) {
		console.error(e);

		return res.status(500).json({
			msg: "err/internal-server-error",
			loc: "user-registration",
		});
	}
};

exports.confirmEmail = async (req, res) => {
	const user = req.userData.email;
	const { token } = req.headers;

	try {
		await req.client.query(
			'UPDATE "user" SET confirmed=true WHERE email=$1',
			[user],
		);
		await req.client.query(
			"INSERT INTO expiring_tokens(token) VALUES($1)",
			[token.split(" ")[1]],
		);

		return res.status(200).json({ msg: "success/account-verified" });
	} catch (e) {
		console.error(e);

		return res.status(500).json({
			msg: "err/internal-server-error",
			loc: "email-confirmation",
		});
	}
};

exports.login = async (req, res) => {
	const { email, password } = req.body;
	const errors = validationResult(req);

	if (!errors.isEmpty) {
		return res.json({ msg: "err/validation-error", errors });
	}

	try {
		const query = await req.client.query(
			`SELECT * FROM "user" WHERE email='${email}'`,
		);

		if (query.rows.length <= 0) {
			return res.send("err/email-not-found");
		}

		const user = query.rows[0];

		console.log(user);

		if (!user.confirmed) {
			return res.json({ msg: "err/user-not-verified" });
		}

		const compare_pwd = await bcrypt.compare(password, user.password);

		if (!compare_pwd) {
			return res.json({ msg: "err/invalid-credentials" });
		}

		const token = genToken(user.email, user.name);

		return res.status(200).json({ msg: "success/logged-in", token });
	} catch (e) {
		console.log(e);

		return res.status(500).json({
			msg: "err/internal-server-error",
			loc: "user-login",
		});
	}
};

exports.editProfileDetails = async (req, res) => {
	const { nEmail, nName } = req.body;
	const profile = req.file ? req.file.filename : null;

	const currentEmail = req.userData.email;
	const errors = validationResult(req);

	if (!errors.isEmpty) {
		return res.json({ msg: "err/validation-error", errors });
	}

	try {
		const existsQuery = await req.client.query(
			`SELECT * FROM "user" WHERE email='${currentEmail}'`,
		);

		if (existsQuery.rows.length <= 0) {
			return res.send("err/email-not-found");
		}

		if (!existsQuery.rows[0].confirmed) {
			if (!user.confirmed) {
				return res.json({ msg: "err/user-not-verified" });
			}
		}

		var query = {
			text: `UPDATE "user" SET email=$1, name=$2 WHERE email=$3`,
			values: [nEmail, nName, currentEmail],
		};

		if (profile) {
			query = {
				text: `UPDATE "user" SET email=$1, name=$2, profile_picture=$3 WHERE email=$4`,
				values: [nEmail, nName, profile, currentEmail],
			};
		}

		await req.client.query(query);

		if (profile) {
			const profilePicturePath = path.join(
				__dirname,
				`../Assets/${existsQuery.rows[0].profile_picture}`,
			);

			try {
				let fileExists = await fs.stat(profilePicturePath);

				if (fileExists) {
					await fs.unlink(profilePicturePath);
				}
			} catch (e) {
				console.log(e);

				return res.status(500).json({
					msg: "err/internal-server-error",
					loc: "error-deleting-old-asset",
				});
			}
		}

		const token = genToken(nEmail, nName);

		return res
			.status(200)
			.json({ msg: "success/profile-details-edited", token });
	} catch (e) {
		console.log(e);

		return res.status(500).json({
			msg: "err/internal-server-error",
			loc: "profile-edit",
		});
	}
};

exports.forgotPassword = async (req, res) => {
	const { email } = req.body;

	const existsQuery = await req.client.query(
		`SELECT * FROM "user" WHERE email='${email}'`,
	);

	if (existsQuery.rows.length <= 0) {
		return res.send("err/email-not-found");
	}

	console.log(existsQuery.rows[0]);

	if (!existsQuery.rows[0].confirmed) {
		return res.json({ msg: "err/user-not-verified" });
	}

	try {
		const token = crypt.randomBytes(64).toString("hex");

		const currentDate = new Date();
		const expiringIn = new Date(currentDate.getTime() + 15 * 60000);

		await req.client.query(
			"INSERT INTO resetTokens(token, expiresAt) VALUES($1, $2)",
			[token, expiringIn],
		);
		await sendMail(
			"Password Reset",
			`To reset password click on the following <a href='http://localhost:3000/token=${token}'>link</a><br>Token: ${token}<br>Expires: ${expiringIn}`,
			email,
		);

		return res.json({ msg: "success/reset-link-token-sent" });
	} catch (e) {
		console.log(e);

		return res.status(500).json({
			msg: "err/internal-server-error",
			loc: "forgot-password",
		});
	}
};

exports.resetPassword = async (req, res) => {
	const { token } = req.headers;
	const { newPassword, email } = req.body;
	const errors = validationResult(req);

	if (!errors.isEmpty) {
		return res.json({ msg: "err/validation-error", errors });
	}

	const existsQuery = await req.client.query(
		`SELECT * FROM "user" WHERE email='${email}'`,
	);

	if (existsQuery.rows.length <= 0) {
		return res.send("err/email-not-found");
	}

	try {
		const verifyTokenQuery = await req.client.query(
			"SELECT * FROM resetTokens WHERE token=$1",
			[token],
		);

		const currentDate = new Date();

		if (currentDate > verifyTokenQuery.rows[0].expiresAt) {
			return res.json({ msg: "err/expired-token" });
		}

		const salt = await bcrypt.genSalt();
		const hash = await bcrypt.hash(newPassword, salt);

		await req.client.query(
			`UPDATE "user" SET password= $1 WHERE email=$2`,
			[hash, email],
		);

		return res.json({ msg: "success/password-reset-successful" });
	} catch (e) {
		console.log(e);

		return res.status(500).json({
			msg: "err/internal-server-error",
			loc: "reset-password",
		});
	}
};
