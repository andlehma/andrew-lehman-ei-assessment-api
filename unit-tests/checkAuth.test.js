import { checkAuth } from '../checkAuth.js';
import { jest } from '@jest/globals';

describe('checkAuth', () => {
	const mockedDBConnection = {
		get: () => {
			return { id: 17 };
		},
	};

	test('requires authorization header', async () => {
		const mockedRequest = { headers: {} };
		const mockedCallback = () => {};
		await expect(
			async () =>
				await checkAuth(mockedDBConnection, mockedRequest, mockedCallback)
		).rejects.toThrow('Authorization required');
	});

	test('requires authorization header to be in the form of a bearer token', async () => {
		const mockedRequest = { headers: { authorization: 'asdf' } };
		const mockedCallback = () => {};
		await expect(
			async () =>
				await checkAuth(mockedDBConnection, mockedRequest, mockedCallback)
		).rejects.toThrow('Authorization should be in the form of a bearer token');
		expect(true).toBe(true);
	});

	test('runs callback if auth is good', async () => {
		const mockedRequest = { headers: { authorization: 'Bearer 1234' } };
		console.log(mockedRequest.headers.authorization);
		const mockedCallback = jest.fn();
		await checkAuth(mockedDBConnection, mockedRequest, mockedCallback);
		expect(mockedCallback).toHaveBeenCalledWith(1234);
	});
});
