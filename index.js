import express from 'express';

import { getAssets } from './coincapHelper.js';
import { initDB, selectUsers, selectAssets } from './database/database.js';

const app = express();
const port = 3000;

app.get('/assets', async (req, res) => {
	const assets = await getAssets();
	res.send(assets);
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
