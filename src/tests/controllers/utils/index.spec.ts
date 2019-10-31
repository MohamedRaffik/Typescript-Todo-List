import { expect } from 'chai';
import { validateFields } from '../../../controllers/utils';

describe('test utils functions', () => {
	const obj = {
		firstName: 'John',
		lastName: 'Doe',
		gender: 'M'
	};

	it('should return an error string if there is field missing', done => {
		const { firstName, ...newObj } = obj;
		const error = validateFields(newObj, ['firstName', 'lastName', 'gender']);
		expect(error).to.equal('"firstName" value is not specified');
		done();
	});

	it('should return an error string if there is field with undefined or null value', done => {
		const newObj = { ...obj, gender: null };
		const error = validateFields(newObj, ['firstName', 'lastName', 'gender']);
		expect(error).to.equal('"gender" value is not valid');
		done();
	});

	it('should return an empty string if there are no errors', done => {
		const error = validateFields(obj, ['firstName', 'lastName', 'gender']);
		expect(error).to.equal('');
		done();
	});
});
