import got from 'got';
import 'dotenv/config';

const api_key = process.env.COINCAP_API_KEY;

const gotOptions = {
	prefixUrl: 'https://api.coincap.io/v2',
	headers: {
		Authorization: `Bearer ${api_key}`,
	},
};

const getAssets = async (limit, offset, search, sort) => {
	try {
		const { data } = await got
			.get(
				`assets?limit=${limit}&offset=${offset}&search=${search}`,
				gotOptions
			)
			.json();

		const asc = sort[0] === '-';
		if (asc) {
			sort = sort.slice(1);
		}

		// only sort if the sort param is valid
		if (data[0][sort]) {
			data.sort((a, b) => {
				if (parseFloat(a[sort])) {
					// sort param is numeric
					return parseFloat(b[sort]) - parseFloat(a[sort]);
				} else {
					return a[sort].localeCompare(b[sort]);
				}
			});

			if (asc) {
				data.reverse();
			}
		}

		return data;
	} catch (error) {
		return error;
	}
};

const getAsset = async (id) => {
	try {
		const { data } = await got.get(`assets/${id}`, gotOptions).json();
		return data;
	} catch (error) {
		return error;
	}
};

const convertToUsd = async (id, amount) => {
	try {
		const { data } = await got.get(`assets/${id}`, gotOptions).json();
		return data.priceUsd * amount;
	} catch (error) {
		return error;
	}
};

const getAssetValueAtTime = async (id, time) => {
	try {
		const unixTimestamp = time.getTime();
		const { data } = await got.get(`assets/${id}/history?interval=m1&start=${unixTimestamp}&end=${unixTimestamp + 60000}`, gotOptions).json();
		const priceAtTime = data[0].priceUsd;
		return priceAtTime;
	} catch (error) {
		return error;
	}
}

export { getAssets, getAsset, convertToUsd, getAssetValueAtTime };
