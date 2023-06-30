import express from 'express';

import { getAssets, getAsset, convertToUsd } from './coincapHelper.js';
import { initDB, selectUsers, selectAssets } from './database/database.js';

const app = express();
const port = 3000;

const maxPageSize = 2000;
const defaultPageSize = 100;

app.use(express.json());

app.get('/assets', async (req, res) => {
	const limit =
		req.query.limit > maxPageSize
			? maxPageSize
			: req.query.limit
			? req.query.limit
			: defaultPageSize;
	const offset = req.query.offset ? req.query.offset : 0;
	const search = req.query.search ? req.query.search : '';
	const sort = req.query.sort ? req.query.sort : '';

	res.send(await getAssets(limit, offset, search, sort));
});

app.get('/assets/:id', async (req, res) => {
	const asset = await getAsset(req.params.id);
	res.send(asset);
});

app.get('/convert/:id', async (req, res) => {
	const amount = req.query.amount ? req.query.amount : 1;
	const value = await convertToUsd(req.params.id, amount);
	res.send({assetId: req.params.id, amount: amount, usdValue: value});
})

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
