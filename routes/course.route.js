const { body } = require("express-validator");
const {
	addCourse,
	courses,
	enroll,
	myCourses,
} = require("../controllers/course.controller");
const { jwtVerification } = require("../utils/jwtVerification");

const Router = require("express").Router();

Router.route("/new").post(
	jwtVerification,
	[
		body("category")
			.notEmpty()
			.isString()
			.withMessage("Category is required."),
		body("course_desc")
			.notEmpty()
			.isString()
			.withMessage("Course description is required."),
		body("course_title")
			.notEmpty()
			.isString()
			.withMessage("Course title is required."),
		body("level")
			.notEmpty()
			.isString()
			.withMessage(
				"Course level (advanced, intermediate, beginner) is required.",
			),
	],
	addCourse,
);

//Fetch all courses
Router.route("/courses").get(courses);

//Register in course
Router.route("/enroll/:cid").post(jwtVerification, enroll);

//Fetch courses the user is registered in
Router.route("/my/courses").get(jwtVerification, myCourses);

module.exports = Router;
