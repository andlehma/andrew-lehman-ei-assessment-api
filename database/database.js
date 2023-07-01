import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as url from 'url';
import { convertToUsd } from '../coincapHelper.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const environment = process.env.NODE_ENV;
const dbFile =
	environment === 'test'
		? path.join(__dirname, 'test.db')
		: path.join(__dirname, 'database.db');
const CLEAR_SQL = readFileSync(path.join(__dirname, 'clearDB.sql')).toString();
const SCHEMA_SQL = readFileSync(
	path.join(__dirname, 'dbSchema.sql')
).toString();
const POPULATE_TEST_DATA = readFileSync(
	path.join(__dirname, 'populateTestData.sql')
).toString();

const getDBConnection = async () => {
	return await open({
		filename: dbFile,
		driver: sqlite3.Database,
	});
};

const clearAndCreateDB = async (db) => {
	await db.exec(CLEAR_SQL);
	await db.exec(SCHEMA_SQL);

	console.log('DB created');
};

const populateTestData = async (db) => {
	await db.exec(POPULATE_TEST_DATA);

	console.log('DB Test data populated');
};

const initDB = async (db) => {
	if (environment === 'test') {
		await clearAndCreateDB(db);
		await populateTestData(db);
	} else if (environment === 'dev') {
		await db.exec(SCHEMA_SQL); // idempotent
	}
};

const createUser = async (db, id, userName) => {
	await db.exec(`INSERT INTO Users VALUES(${id}, "${userName}")`);
	const user = await getUser(db, id);
	return user;
};

const selectUsers = async (db) => {
	try {
		return await db.all('SELECT * FROM Users');
	} catch (error) {
		return `Error getting users: ${error}`;
	}
};

const selectAssets = async (db) => {
	try {
		return await db.all('SELECT * FROM User_Assets');
	} catch (error) {
		return `Error getting users: ${error}`;
	}
};

const getUser = async (db, id) => {
	const user = await db.get(`SELECT * FROM Users WHERE ID = ${id}`);
	if (user) {
		return user;
	} else {
		throw new Error(`No user with id ${id}`);
	}
};

const getMyAssets = async (db, id) => {
	const assets = await db.all(
		`SELECT * FROM User_Assets WHERE User_ID = ${id}`
	);
	return await Promise.all(
		assets.map(async (asset) => {
			return {
				...asset,
				valueInUSD: await convertToUsd(asset.AssetID, asset.Quantity),
			};
		})
	);
};

const getMyAsset = async (db, userId, assetId) => {
	const asset = await db.get(
		`SELECT * From User_Assets WHERE User_ID = ${userId} AND AssetID = "${assetId}"`
	);
	return asset;
};

const addAssets = async (db, userId, assetId, amount) => {
	try {
		const existingAsset = await db.get(
			`SELECT * From User_Assets WHERE User_ID = ${userId} AND AssetID = "${assetId}"`
		);
		if (existingAsset) {
			const newQuant = existingAsset.Quantity + amount;
			await db.exec(
				`UPDATE User_Assets SET Quantity = ${newQuant} WHERE User_ID = ${userId} AND AssetID = "${assetId}"`
			);
		} else {
			await db.exec(
				`INSERT INTO User_Assets VALUES ("${assetId}", ${amount}, ${userId})`
			);
		}
		const updatedAsset = await db.get(
			`SELECT * From User_Assets WHERE User_ID = ${userId} AND AssetID = "${assetId}"`
		);
		return updatedAsset;
	} catch (error) {
		return `Error adding assets: ${error}`;
	}
};

export {
	getDBConnection,
	initDB,
	selectUsers,
	createUser,
	selectAssets,
	getUser,
	getMyAssets,
	getMyAsset,
	addAssets,
};
