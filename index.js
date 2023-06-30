const express = require("express");
require('dotenv').config();
const api_key = process.env.COINCAP_API_KEY
const app = express();
const port = 3000;

app.get("/", (req, res) => {
	res.send("Hello, World!");
});

app.listen(port, () => {
	console.log(`Hello World app running on port ${port}`);
});
