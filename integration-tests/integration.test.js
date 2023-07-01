import request from 'supertest';
import { jest } from '@jest/globals';
import got from 'got';

import { app } from '../app.js';

describe('api', () => {
	describe('get /assets', () => {
		test('should return a list of assets as passed by the external API', async () => {
			const testAssets = {
				data: [
					{ id: 'bitcoin', priceUSD: '30570' },
					{ id: 'ethereum', priceUSD: '1920' },
				],
			};
			const mockGet = jest.spyOn(got, 'get');
			mockGet.mockReturnValue({
				json: async () => {
					return Promise.resolve(testAssets)
				},
			});
			const { body } = await request(app).get('/assets');
			expect(body).toEqual(testAssets.data);
		});
	});
});
