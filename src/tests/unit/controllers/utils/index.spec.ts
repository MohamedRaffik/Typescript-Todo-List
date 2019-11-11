import { expect } from 'chai';
import { validateArray, validateFields } from '../../../../controllers/utils';

describe('Unit Testing utils functions', () => {
	describe('testing validateFields', () => {
		const obj = {
			firstName: 'John',
			lastName: 'Doe',
			gender: 'M'
		};

		it('should return an error string if there is field missing', async () => {
			const { firstName, ...newObj } = obj;
			const error = validateFields(newObj, {
				firstName: {},
				lastName: { type: 'string' },
				gender: { type: 'string' }
			});
			expect(error).to.equal("'firstName' is not specified");
		});

		it('should return an error string if there is field with undefined or null value', async () => {
			const newObj = { ...obj, gender: null };
			const error = validateFields(newObj, {
				firstName: { type: 'string' },
				lastName: { type: 'string' },
				gender: { type: 'string' }
			});
			expect(error).to.equal("'gender' value is not valid");
		});

		it('should return an error string if there is field does not match a defined enum', async () => {
			const newObj = { ...obj, gender: 'Alien' };
			const error = validateFields(newObj, {
				firstName: { type: 'string' },
				lastName: { type: 'string' },
				gender: { type: 'string', enum: new Set(['male', 'female']) }
			});
			expect(error).to.equal("'gender' must have a value of 'male or female'");
		});

		it('should return an empty string if there is a default value for the incorrect field and set the field to that value', async () => {
			const newObj = {};
			const error = validateFields(newObj, {
				species: { type: 'string', default: 'human' }
			});
			expect(error).to.equal('');
			expect(newObj).to.deep.equal({ species: 'human' });
		});

		it('should return an empty string if there are no errors', async () => {
			const error = validateFields(obj, {
				firstName: { type: 'string' },
				lastName: { type: 'string' },
				gender: { type: 'string' }
			});
			expect(error).to.equal('');
		});
	});

	describe('testing validateArray', () => {
		const arr = ['val1', 'val2'];

		it('should return an error if the values of the array do not match the given type', async () => {
			const arr2 = [...arr, 10];
			const error = validateArray(arr2, { type: 'string' });
			expect(error).to.equal("Values of '[ val1, val2, 10 ]' must be of type 'string'");
		});

		it('should return an error if the array does not contain all the enum values', () => {
			const error = validateArray(arr, { type: 'string', enum: new Set(['val2', 'val3']) });
			expect(error).to.equal("'[ val1, val2 ]' must include these values '[ val3 ]'");
		});

		it('should return an empty string and remove duplicates if there are no errors and removeDuplicates is set', async () => {
			const arr2 = [...arr, 'val1'];
			const error = validateArray(arr2, {
				type: 'string',
				enum: new Set(['val1']),
				removeDuplicates: true
			});
			expect(error).to.equal('');
			expect(arr2).to.deep.equal(arr);
		});

		it('should return an empty string if there are not errors', async () => {
			const error = validateArray(arr, { type: 'string', enum: new Set(['val1']) });
			expect(error).to.equal('');
		});
	});
});
