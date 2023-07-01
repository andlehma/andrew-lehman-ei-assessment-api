import express from 'express';

import {
	getAssets,
	getAsset,
	convertToUsd,
	getAssetValueAtTime,
} from './coincapHelper.js';
import {
	getDBConnection,
	selectUsers,
	selectAssets,
	getUser,
	getMyAssets,
	addAssets,
	getMyAsset,
	createUser,
} from './database/database.js';
import { checkAuth } from './checkAuth.js';

const app = express();

const maxPageSize = 2000;
const defaultPageSize = 100;

const dbConnection = await getDBConnection();

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
	res.send({ assetId: req.params.id, amount: amount, usdValue: value });
});

app.get('/users', async (req, res) => {
	const users = await selectUsers(dbConnection);
	res.send(users);
});

app.post('/users', async (req, res) => {
	try {
		if (!req.body.id) {
			res.send('User ID required');
			return;
		}
		if (!req.body.userName) {
			res.send('User Name required');
			return;
		}
		const user = await createUser(dbConnection, req.body.id, req.body.userName);
		res.send(user);
	} catch (error) {
		res.send(error.toString());
	}
});

app.get('/user/:id', async (req, res) => {
	const user = await getUser(dbConnection, req.params.id);
	res.send(user);
});

app.get('/userAssets', async (req, res) => {
	const assets = await selectAssets(dbConnection);
	res.send(assets);
});

app.get('/myAssets', async (req, res) => {
	try {
		checkAuth(req, async (userId) => {
			const assets = await getMyAssets(dbConnection, userId);
			const totalValue = assets
				.reduce((acc, curr) => acc + curr.valueInUSD, 0)
				.toFixed(2);
			res.send({ totalValue: totalValue, assets: assets });
		});
	} catch (error) {
		res.send(error.toString());
	}
});

app.post('/addAssets', async (req, res) => {
	try {
		checkAuth(req, async (userId) => {
			if (!req.body.assetId) {
				res.send('Asset ID required');
				return;
			}
			if (!req.body.amount) {
				res.send('Amount required');
				return;
			}
			const assetDetails = await getAsset(req.body.assetId);
			if (!assetDetails.id) {
				res.send(`Invalid asset id: ${req.body.assetId}`);
				return;
			}
			const asset = await addAssets(
				dbConnection,
				userId,
				req.body.assetId,
				req.body.amount
			);
			res.send(asset);
		});
	} catch (error) {
		res.send(error.toString());
	}
});

app.get('/gainOverTime/:assetId', async (req, res) => {
	try {
		checkAuth(req, async (userId) => {
			const currentAsset = await getMyAsset(
				dbConnection,
				userId,
				req.params.assetId
			);
			const amountHeld = currentAsset.Quantity;
			const dateAcquired = new Date(req.query.acquired);
			const initialValue =
				(await getAssetValueAtTime(req.params.assetId, dateAcquired)) *
				amountHeld;
			const nowValue = await convertToUsd(req.params.assetId, amountHeld);
			const diff = nowValue - initialValue;
			res.send({
				valueAtTime: initialValue.toFixed(2),
				valueNow: nowValue.toFixed(2),
				gainUSD: diff.toFixed(2),
				gainPercent: (diff / initialValue) * 100,
			});
		});
	} catch (error) {
		res.send(error.toString());
	}
});

export { app };
