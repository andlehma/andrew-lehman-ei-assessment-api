import { checkAuth } from '../checkAuth.js';
import { jest } from '@jest/globals';

describe('checkAuth', () => {
	test('requires authorization header', () => {
		const mockedRequest = { headers: {} };
		const mockedCallback = () => {};
		expect(() => checkAuth(mockedRequest, mockedCallback)).toThrow(
			'Authorization required'
		);
	});

	test('requires authorization header to be in the form of a bearer token', () => {
		const mockedRequest = { headers: { authorization: 'asdf' } };
		const mockedCallback = () => {};
		expect(() => checkAuth(mockedRequest, mockedCallback)).toThrow(
			'Authorization should be in the form of a bearer token'
		);
	});

	test('runs callback if auth is good', () => {
		const mockedRequest = { headers: { authorization: 'Bearer 1234' } };
		const mockedCallback = jest.fn();
		checkAuth(mockedRequest, mockedCallback);
		expect(mockedCallback).toHaveBeenCalledWith(1234);
	});
});
