import { sortAssets } from '../coincapHelper';

describe('sort', () => {
	test('sort by name', () => {
		// arrange
		const unsorted = [
			{
				id: 'bitcoin',
			},
			{
				id: 'tether',
			},
			{
				id: 'ethereum',
			},
		];

		const expected = [
			{
				id: 'bitcoin',
			},
			{
				id: 'ethereum',
			},
			{
				id: 'tether',
			},
		];

		// act
		const output = sortAssets(unsorted, 'id');

		// assert
		expect(output).toEqual(expected);
	});

	test('sort by price ascending', () => {
		// arrange
		const unsorted = [
			{
				id: 'bitcoin',
				priceUsd: '30612',
			},
			{
				id: 'tether',
				priceUsd: '1',
			},
			{
				id: 'ethereum',
				priceUsd: '1924',
			},
		];

		const expected = [
			{
				id: 'tether',
				priceUsd: '1',
			},
			{
				id: 'ethereum',
				priceUsd: '1924',
			},
			{
				id: 'bitcoin',
				priceUsd: '30612',
			},
		];

		// act
		const output = sortAssets(unsorted, '-priceUsd');

		// assert
		expect(output).toEqual(expected);
	});
});
