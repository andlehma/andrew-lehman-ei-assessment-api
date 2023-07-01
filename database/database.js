import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as url from 'url';
import { convertToUsd } from '../coincapHelper.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const dbFile = path.join(__dirname, 'database.db');
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
	await clearAndCreateDB(db);
	await populateTestData(db);
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
	try {
		const user = await db.get(`SELECT * FROM Users WHERE ID = ${id}`);
		if (user) {
			return user;
		} else {
			throw new Error(`No user with id ${id}`);
		}
	} catch (error) {
		return `Error getting user with id ${id}: ${error}`;
	}
};

const getMyAssets = async (db, id) => {
	try {
		const assets = await db.all(
			`SELECT * FROM User_Assets WHERE User_ID = ${id}`
		);
		return await Promise.all(assets.map(async (asset) => {
			return {
				...asset,
				valueInUSD: await convertToUsd(asset.AssetID, asset.Quantity),
			};
		}));
	} catch (error) {
		return `Error getting assets: ${error}`;
	}
};

const getMyAsset = async (db, userId, assetId) => {
    try {
        const asset = await db.get(
            `SELECT * From User_Assets WHERE User_ID = ${userId} AND AssetID = "${assetId}"`
        );
        return asset;
    } catch (error) {
        return `Error getting asset: ${error}`
    }
}

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

export { getDBConnection, initDB, selectUsers, selectAssets, getUser, getMyAssets, getMyAsset, addAssets };
