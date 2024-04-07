const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { client, conn } = require("./config/db");
const Routes = require("./routes/routes");

const app = express();
const PORT = process.env.PORT || 3001;

conn();

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use((req, res, next) => {
	req.client = client;

	next();
});

app.use("/api", Routes);

app.listen(PORT, () => {
	console.log(
		`Server is running on port ${PORT}@http://${process.env.SERVER}:${PORT}`,
	);
});
