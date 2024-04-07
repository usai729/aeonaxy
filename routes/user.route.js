const Router = require("express").Router();
const multer = require("multer");
const path = require("path");
const uuid = require("uuid");

const {
	register,
	login,
	editProfileDetails,
	confirmEmail,
	forgotPassword,
	resetPassword,
} = require("../controllers/user.controller");
const { body } = require("express-validator");
const { jwtVerification } = require("../utils/jwtVerification");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const destinationPath = path.join(__dirname, "../Assets");
		cb(null, destinationPath);
	},
	filename: function (req, file, cb) {
		cb(null, uuid.v1() + file.originalname);
	},
});

const upload = multer({ storage: storage });

//Register new user
Router.route("/register").post(
	[
		body("email").isLength({ min: 3 }),
		body("password").notEmpty(),
		body("name").notEmpty(),
	],
	upload.single("profile"),
	register,
);

//Confirm new user's email
Router.route("/confirm-email").put(jwtVerification, confirmEmail);

//Login existing user
Router.route("/login").post(
	[body("email").isLength({ min: 3 }), body("password").notEmpty()],
	login,
);

//Edit profile details
Router.route("/editProfileDetails").put(
	[body("email").isLength({ min: 3 }), body("name").notEmpty()],
	upload.single("new_profile"),
	jwtVerification,
	editProfileDetails,
);

Router.route("/forgot-password").post(forgotPassword);
Router.route("/reset-password").put(
	[body("email").notEmpty().isEmail(), body("newPassword").notEmpty()],
	resetPassword,
);

module.exports = Router;
