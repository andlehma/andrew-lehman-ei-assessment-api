import express from 'express';

import { getAssets } from './coincapHelper.js';

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
	const data = await getAssets();
	res.send(data);
});

app.listen(port, () => {
	console.log(`API running on port ${port}`);
});
