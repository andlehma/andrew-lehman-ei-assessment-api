import got from 'got';
import 'dotenv/config';

const api_key = process.env.COINCAP_API_KEY;

const gotOptions = {
	prefixUrl: 'https://api.coincap.io/v2',
	headers: {
		Authorization: `Bearer ${api_key}`,
	},
};

const getAssets = async (limit, offset, search) => {
	try {
		const { data } = await got.get(`assets?limit=${limit}&offset=${offset}&search=${search}`, gotOptions).json();
		return data;
	} catch (error) {
		return error;
	}
};

export { getAssets };
