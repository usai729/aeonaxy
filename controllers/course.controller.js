const { validationResult } = require("express-validator");
const currentUserId = require("../utils/currentUserId");

exports.addCourse = async (req, res) => {
	const { category, course_desc, course_title, level, skills } = req.body;
	const errors = validationResult(req);

	const skills_arr = JSON.parse(skills);

	if (!errors.isEmpty()) {
		return res
			.status(400)
			.json({ msg: "err/invalid-data", errors: errors.array() });
	}

	const current_user = req.userData.email;

	const query_isSuperadmin = await req.client.query(
		`SELECT * FROM "user" WHERE email=$1`,
		[current_user],
	);

	if (query_isSuperadmin.rows.length <= 0) {
		return res.status(401).json({ msg: "err/user-not-found" });
	}

	if (query_isSuperadmin.rows[0].role != "superadmin") {
		return res
			.status(403)
			.json({ msg: "err/unauthorized-role-for-action" });
	}

	try {
		const pgSkillsArray = `{${skills_arr.join(",")}}`;

		const query = {
			text: `INSERT INTO courses(category, course_desc, course_title, level, skills)
             VALUES ($1, $2, $3, $4, $5)`,
			values: [category, course_desc, course_title, level, pgSkillsArray],
		};

		await req.client.query(query);

		return res.status(200).json({ msg: "success/course-added" });
	} catch (e) {
		console.error(e);

		return res.status(500).json({
			msg: "err/internal-server-error",
			loc: "add-course",
		});
	}
};

exports.courses = async (req, res) => {
	const { filterLevel, filterPopularity } = req.body;
	const page = parseInt(req.query.page) || 1;
	const size = parseInt(req.query.size) || 2;

	const offset = (page - 1) * size;

	try {
		let query = `SELECT * FROM courses LIMIT ${size} OFFSET ${offset}`;

		if (filterLevel && filterPopularity) {
			query = `SELECT * FROM courses WHERE level=${filterLevel} AND popularity=${filterPopularity} LIMIT ${size} OFFSET ${offset}`;
		}

		if (filterLevel) {
			query = `SELECT * FROM courses WHERE level=${filterLevel} LIMIT ${size} OFFSET ${offset}`;
		}

		if (filterPopularity) {
			query = `SELECT * FROM courses WHERE level=${filterPopularity} LIMIT ${size} OFFSET ${offset}`;
		}

		const course_list = await req.client.query(query);

		return res.json({
			msg: "success/courses-fetched",
			courses: course_list.rows,
		});
	} catch (e) {
		console.error(e);

		return res.status(500).json({
			msg: "err/internal-server-error",
			loc: "get-courses",
		});
	}
};

exports.enroll = async (req, res) => {
	const { cid } = req.params;

	const course_exists = await req.client.query(
		"SELECT * FROM courses WHERE id=$1",
		[cid],
	);

	if (course_exists.rows.length <= 0) {
		return res.json({ msg: "err/course-not-found" });
	}

	try {
		const currentUser_id = await currentUserId(req, req.userData.email);

		const enrolled = await req.client.query(
			'SELECT * FROM enrollments WHERE course=$1 AND "user"=$2',
			[cid, currentUser_id],
		);

		if (enrolled.rows.length > 0) {
			return res.json({ msg: "err/already-enrolled" });
		}

		await req.client.query(
			'INSERT INTO enrollments(course, "user") VALUES($1, $2)',
			[cid, currentUser_id],
		);

		return res.json({ msg: "success/enrolled-new" });
	} catch (e) {
		console.log(e);

		return res.status(500).json({
			msg: "err/internal-server-error",
			loc: "enroll-in-course",
		});
	}
};

exports.myCourses = async (req, res) => {
	const currentUser_id = await currentUserId(req, req.userData.email);

	try {
		var my_courses = await req.client.query(
			'SELECT * FROM enrollments JOIN courses ON enrollments.course = courses.id WHERE enrollments."user" = $1',
			[currentUser_id],
		);

		my_courses = my_courses.rows;

		return res.json({ msg: "success/my-courses", my_courses });
	} catch (e) {
		console.log(e);

		return res.status(500).json({
			msg: "err/internal-server-error",
			loc: "my-courses",
		});
	}
};
