const Router = require("express").Router();
const multer = require("multer");

const UserRoute = require("./user.route");
const CourseRoute = require("./course.route");

Router.use("/user", UserRoute);
Router.use("/course", CourseRoute);

module.exports = Router;
