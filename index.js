import express from 'express';

import { getAssets, getAsset, convertToUsd } from './coincapHelper.js';
import {
	initDB,
	selectUsers,
	selectAssets,
	getUser,
	getMyAssets,
	addAssets,
} from './database/database.js';

const app = express();
const port = 3000;

const maxPageSize = 2000;
const defaultPageSize = 100;

app.use(express.json());

const checkAuth = (req, callback) => {
	if (req.headers.authorization) {
		if (req.headers.authorization.startsWith('Bearer ')) {
			const userId = parseInt(
				req.headers.authorization.slice('Bearer '.length)
			);
			callback(userId);
		} else {
			res.send('Authorization should be in the form of a bearer token');
		}
	} else {
		res.send('Authorization required');
	}
};

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
	res.send({ assetId: req.params.id, amount: amount, usdValue: value });
});

app.get('/users', async (req, res) => {
	const users = await selectUsers();
	res.send(users);
});

app.get('/user/:id', async (req, res) => {
	const user = await getUser(req.params.id);
	res.send(user);
});

app.get('/userAssets', async (req, res) => {
	const assets = await selectAssets();
	res.send(assets);
});

app.get('/myAssets', async (req, res) => {
	checkAuth(req, async (userId) => {
		const assets = await getMyAssets(userId);
		res.send(assets);
	});
});

app.post('/addAssets', async (req, res) => {
	checkAuth(req, async (userId) => {
		// should probably check that the assetId is valid
		const asset = await addAssets(userId, req.body.assetId, req.body.amount);
		res.send(asset);
	});
});

app.listen(port, async () => {
	await initDB();
	console.log(`API running on port ${port}`);
});
