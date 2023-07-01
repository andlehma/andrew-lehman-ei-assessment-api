import request from 'supertest';
import { jest } from '@jest/globals';
import got from 'got';
import { getDBConnection, initDB } from '../database/database.js';

import { app } from '../app.js';

describe('api', () => {
	beforeEach(() => {
		process.env.NODE_ENV = 'test';
	});

	afterEach(() => {
		delete process.env.NODE_ENV;
	});

	const gotOptions = {
		prefixUrl: 'https://api.coincap.io/v2',
		headers: {
			Authorization: expect.anything(),
		},
	};
	describe('get /assets', () => {
		const defaultLimit = 100;
		const defaultOffset = 0;
		const defaultSearch = '';

		test('should call the coincap API with default values and return a list of assets as passed by the coincap API', async () => {
			// arrange
			const testAssets = [
				{ id: 'bitcoin', priceUSD: '30570' },
				{ id: 'ethereum', priceUSD: '1920' },
			];
			const mockGet = jest.spyOn(got, 'get');
			mockGet.mockReturnValue({
				json: async () => {
					return Promise.resolve({ data: testAssets });
				},
			});

			// act
			const { body } = await request(app).get('/assets');

			// assert
			expect(mockGet).toHaveBeenCalledWith(
				`assets?limit=${defaultLimit}&offset=${defaultOffset}&search=${defaultSearch}`,
				gotOptions
			);
			expect(body).toEqual(testAssets);
		});

		test('should call the coincap API with provided limit, offset, and search parameters', async () => {
			// arrange
			const mockGet = jest.spyOn(got, 'get');
			mockGet.mockReturnValue({
				json: async () => {
					return Promise.resolve(testAssets);
				},
			});
			const testLimit = 3;
			const testOffset = 7;
			const testSearch = 'tether';

			// act
			await request(app).get(
				`/assets?limit=${testLimit}&offset=${testOffset}&search=${testSearch}`
			);

			// assert
			expect(mockGet).toHaveBeenCalledWith(
				`assets?limit=${testLimit}&offset=${testOffset}&search=${testSearch}`,
				gotOptions
			);
		});
	});

	describe('get /assets/:id', () => {
		const testAssetID = 'bitcoin';
		const testAsset = { id: testAssetID, priceUSD: '32120' };
		test('should return a single asset with the specified id', async () => {
			// arrange
			const mockGet = jest.spyOn(got, 'get');
			mockGet.mockReturnValue({
				json: async () => {
					return Promise.resolve({ data: testAsset });
				},
			});

			// act
			const { body } = await request(app).get(`/assets/${testAssetID}`);

			// assert
			expect(mockGet).toHaveBeenCalledWith(`assets/${testAssetID}`, gotOptions);
			expect(body).toEqual(testAsset);
		});
	});

	describe('get /convert/:id', () => {
		const testAssetID = 'bitcoin';
		const testAssetPrice = 31401;
		const testAsset = { id: testAssetID, priceUsd: testAssetPrice };
		test('should return a USD value for a specified asset with default amount 1', async () => {
			// arrange
			const mockGet = jest.spyOn(got, 'get');
			mockGet.mockReturnValue({
				json: async () => {
					return Promise.resolve({ data: testAsset });
				},
			});

			// act
			const { body } = await request(app).get(`/convert/${testAssetID}`);

			// assert
			const expected = {
				amount: 1,
				assetId: testAssetID,
				usdValue: testAssetPrice,
			};
			expect(body).toEqual(expected);
		});

		test('should return a USD value for a specified asset with user specified amount', async () => {
			// arrange
			const testAmount = 2.3;
			const mockGet = jest.spyOn(got, 'get');
			mockGet.mockReturnValue({
				json: async () => {
					return Promise.resolve({ data: testAsset });
				},
			});

			// act
			const { body } = await request(app).get(
				`/convert/${testAssetID}?amount=${testAmount}`
			);

			// assert
			const expected = {
				amount: testAmount.toString(),
				assetId: testAssetID,
				usdValue: testAssetPrice * testAmount,
			};
			expect(body).toEqual(expected);
		});
	});

	describe('get /myAssets', () => {
		let dbConnection;
		beforeEach(async () => {
			dbConnection = await getDBConnection();
			await initDB(dbConnection);
		});

		afterEach(async () => {
			dbConnection.close();
		});

		test('returns assets of authorized user', async () => {
			// arrange
			const mockGet = jest.spyOn(got, 'get');
			mockGet.mockReturnValue({
				json: async () => {
					return Promise.resolve({ data: { priceUsd: 1 } });
				},
			});

			// act
			const { body } = await request(app)
				.get('/myAssets')
				.set({ authorization: 'Bearer 1' });

			// assert
			const expected = {
				assets: [
					{
						AssetID: 'bitcoin',
						Quantity: 9.675,
						User_ID: 1,
						valueInUSD: 9.675,
					},
					{
						AssetID: 'ethereum',
						Quantity: 54.928,
						User_ID: 1,
						valueInUSD: 54.928,
					},
					{
						AssetID: 'dogecoin',
						Quantity: 1000,
						User_ID: 1,
						valueInUSD: 1000,
					},
				],
				totalValue: '1064.60',
			};
			expect(body).toEqual(expected);
		});
	});

	describe('post /addAssets', () => {
		let dbConnection;
		beforeEach(async () => {
			dbConnection = await getDBConnection();
			await initDB(dbConnection);
		});

		afterEach(async () => {
			dbConnection.close();
		});

		test("adds assets to authorized user's wallet", async () => {
			// arrange
			const testAssetID = 'ethereum';
			const testAsset = { id: testAssetID, priceUSD: '1019.32' };
			const mockGet = jest.spyOn(got, 'get');
			mockGet.mockReturnValue({
				json: async () => {
					return Promise.resolve({ data: testAsset });
				},
			});

			const payload = { assetId: testAssetID, amount: 10.28 };

			// act
			const { body } = await request(app)
				.post('/addAssets')
				.send(payload)
				.set({ authorization: 'Bearer 1' });

			// assert
			const expected = { AssetID: 'ethereum', Quantity: 65.208, User_ID: 1 };
			expect(body).toEqual(expected);
		});

		test('fails to add asset if invalid asset id', async () => {
			// arrange
			const testAsset = {};
			const mockGet = jest.spyOn(got, 'get');
			mockGet.mockReturnValue({
				json: async () => {
					return Promise.resolve({ data: testAsset });
				},
			});

			const payload = { assetId: 'invalidID', amount: 10.28 };

			// act
			const resp = await request(app)
				.post('/addAssets')
				.send(payload)
				.set({ authorization: 'Bearer 1' });

			// assert
			expect(resp.text).toBe('Invalid asset id: invalidID');
		});
	});

	describe('get /gainOverTime/:assetId', () => {
		let dbConnection;
		beforeEach(async () => {
			dbConnection = await getDBConnection();
			await initDB(dbConnection);
		});

		afterEach(async () => {
			dbConnection.close();
		});

		test('returns a calculated gain over a period of time for a specified asset in USD', async () => {
			// arrange
			const assetId = 'bitcoin';
			const testAssetOld = { priceUsd: 28000 };
			const testAssetNew = { priceUsd: 32000 };
			const mockGet = jest.spyOn(got, 'get');
			mockGet
				.mockReturnValueOnce({
					json: async () => {
						return Promise.resolve({ data: [testAssetOld] });
					},
				})
				.mockReturnValueOnce({
					json: async () => {
						return Promise.resolve({ data: testAssetNew });
					},
				});

			// act
			const { body } = await request(app)
				.get(`/gainOverTime/${assetId}?acquired=2023-06-28`)
				.set({ authorization: 'Bearer 1' });

			// assert
			const expected = {
				gainPercent: 14.285714285714285,
				gainUSD: '38700.00',
				valueAtTime: '270900.00',
				valueNow: '309600.00',
			};
			expect(body).toEqual(expected);
		});
	});
});
