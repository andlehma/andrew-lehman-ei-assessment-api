import { app } from './app.js';
import { initDB, getDBConnection } from './database/database.js';

const port = 3000;

app.listen(port, async () => {
	const dbConnection = await getDBConnection();
	await initDB(dbConnection);
	console.log(`API running on port ${port}`);
});
