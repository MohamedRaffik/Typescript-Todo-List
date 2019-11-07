import { expect } from 'chai';
import { validateFields } from '../../../controllers/utils';

describe('test utils functions', () => {
	const obj = {
		firstName: 'John',
		lastName: 'Doe',
		gender: 'M'
	};

	it('should return an error string if there is field missing', async () => {
		const { firstName, ...newObj } = obj;
		const error = validateFields(newObj, {
			firstName: { type: 'string' },
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
