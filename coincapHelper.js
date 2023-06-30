import got from 'got';
import 'dotenv/config';

const api_key = process.env.COINCAP_API_KEY;

const gotOptions = {
	prefixUrl: 'https://api.coincap.io/v2',
	headers: {
		Authorization: `Bearer ${api_key}`,
	},
};

const getAssets = async (limit, offset) => {
	const { data } = await got.get(`assets?limit=${limit}&offset=${offset}`, gotOptions).json();
	return data;
};

export { getAssets };
