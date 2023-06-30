import express from 'express';

import { getAssets } from './coincapHelper.js';
import { initDB, selectUsers, selectAssets } from './database/database.js';

const app = express();
const port = 3000;

app.use(express.json());

app.get('/assets', async (req, res) => {
	const assets = await getAssets();
	res.send(assets);
});

app.post('/assets', async (req, res) => {
	const assets = await getAssets();
	const pageSize = req.body.pageSize ? req.body.pageSize : 10;

	var pageNumber = req.body.pageNumber ? req.body.pageNumber : 1;

	const pageCount = assets.length / pageSize;

	pageNumber = pageNumber > pageCount ? pageCount : pageNumber;
	res.json({
		pageNumber: pageNumber,
		pageCount: pageCount,
		assets: assets.slice(
			pageNumber * pageSize - pageSize,
			pageNumber * pageSize
		),
	});
});

app.get('/users', async (req, res) => {
	const users = await selectUsers();
	res.send(users);
});

app.get('/userAssets', async (req, res) => {
	const assets = await selectAssets();
	res.send(assets);
});

app.listen(port, async () => {
	await initDB();
	console.log(`API running on port ${port}`);
});
