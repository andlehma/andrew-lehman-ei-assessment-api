import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { readFileSync } from 'fs';
import * as path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const dbFile = path.join(__dirname, 'database.db');
const CLEAR_SQL = readFileSync(path.join(__dirname, 'clearDB.sql')).toString();
const SCHEMA_SQL = readFileSync(path.join(__dirname, 'dbSchema.sql')).toString();
const POPULATE_TEST_DATA = readFileSync(path.join(__dirname, 'populateTestData.sql')).toString();

const getDBConnection = async () => {
    return await open({
        filename: dbFile,
        driver: sqlite3.Database,
    })
}

const clearAndCreateDB = async () => {
    const db = await getDBConnection();

	await db.exec(CLEAR_SQL);
	await db.exec(SCHEMA_SQL);

    console.log('DB created')
};

const populateTestData = async () => {
    const db = await getDBConnection();

    await db.exec(POPULATE_TEST_DATA);

    console.log('DB Test data populated')
};

const initDB = async () => {
    await clearAndCreateDB();
    await populateTestData();
}

const selectUsers = async () => {
    const db = await getDBConnection();

	try {
		return await db.all('SELECT * FROM Users');
	} catch (error) {
		return `Error getting users: ${error}`;
	}
};

const selectAssets = async () => {
    const db = await getDBConnection();

	try {
		return await db.all('SELECT * FROM User_Assets');
	} catch (error) {
		return `Error getting users: ${error}`;
	}
};

export { initDB, selectUsers, selectAssets };