const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async (sub, html, to) => {
	try {
		await resend.emails.send({
			from: "onboarding@resend.dev",
			to: to,
			subject: sub,
			html: html,
		});
	} catch (e) {
		console.error(e);

		return res.status(500).json({
			msg: "err/internal-server-error",
			loc: "mailer",
		});
	}
};

module.exports = sendMail;
