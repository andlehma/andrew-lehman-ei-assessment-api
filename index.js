import express from 'express';

import { getAssets } from './coincapHelper.js';
import { initDB, selectUsers, selectAssets } from './database/database.js';

const app = express();
const port = 3000;

const maxPageSize = 2000;
const defaultPageSize = 100;

app.use(express.json());

app.get('/assets', async (req, res) => {
	const limit = req.query.limit > maxPageSize ? 
		maxPageSize : req.query.limit ?
		req.query.limit : defaultPageSize;
	const offset = req.query.offset ? req.query.offset : 0;

	res.send(await getAssets(limit, offset));
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
