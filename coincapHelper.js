import got from 'got';
import 'dotenv/config';

const api_key = process.env.COINCAP_API_KEY;

const gotOptions = {
	prefixUrl: 'https://api.coincap.io/v2',
	headers: {
		Authorization: `Bearer ${api_key}`,
	},
};

const getAssets = async (limit, offset, search, sortParam) => {
	try {
		const resp = await got
			.get(
				`assets?limit=${limit}&offset=${offset}&search=${search}`,
				gotOptions
			)
			.json();

		const sortedAssets = sortAssets(resp.data, sortParam);
		return sortedAssets;
	} catch (error) {
		return error;
	}
};

const sortAssets = (assets, sortParam) => {
	const asc = sortParam[0] === '-';
	if (asc) {
		sortParam = sortParam.slice(1);
	}
	// only sort if the sort param is valid
	if (assets[0][sortParam]) {
		assets.sort((a, b) => {
			if (parseFloat(a[sortParam])) {
				// sort param is numeric
				return parseFloat(b[sortParam]) - parseFloat(a[sortParam]);
			} else {
				return a[sortParam].localeCompare(b[sortParam]);
			}
		});

		if (asc) {
			assets.reverse();
		}
	}
	return assets;
};

const getAsset = async (id) => {
	try {
		const resp = await got.get(`assets/${id}`, gotOptions).json();
		return resp.data;
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
		const { data } = await got
			.get(
				`assets/${id}/history?interval=m1&start=${unixTimestamp}&end=${
					unixTimestamp + 60000
				}`,
				gotOptions
			)
			.json();
		const priceAtTime = data[0].priceUsd;
		return priceAtTime;
	} catch (error) {
		return error;
	}
};

export { getAssets, getAsset, convertToUsd, getAssetValueAtTime, sortAssets };
