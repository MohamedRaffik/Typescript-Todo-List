import { expect } from 'chai';
import { Request, Response } from 'express';
import sinon from 'sinon';
import RegisterController from '../../../controllers/auth/register';
import createMockContext, { MockRequest, MockResponse } from '../../mock';

const context = createMockContext();
const [Register] = RegisterController(context);

describe('testing Register controller', () => {
	const req = ({ body: {} } as MockRequest) as Request;
	const res = (new MockResponse() as unknown) as Response;
	const resStatusSpy = sinon.spy(res, 'status');
	const resJsonSpy = sinon.spy(res, 'json');
	const { db } = context;

	beforeEach(async () => {
		req.body = {};
		db.dropCollection('Users');
		resStatusSpy.resetHistory();
		resJsonSpy.resetHistory();
	});

	it('should return an error if there is a missing email, username, or password', async () => {
		await Register(req, res);
		expect(resStatusSpy.calledOnceWith(400)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				error:
					"'email' is not specified, 'password' is not specified, 'username' is not specified"
			})
		).to.equal(true);
	});

	it('should return an error if a field has an incorrect type', async () => {
		req.body = {
			email: 10,
			password: 'password123',
			username: 'John Doe'
		};
		await Register(req, res);
		expect(resStatusSpy.calledOnceWith(400)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				error: "'email' value must be of type string"
			})
		).to.equal(true);
	});

	it('should return an error if the password length is shorter than 8 characters', async () => {
		req.body = {
			email: 'someemail@gmail.com',
			username: 'John Doe',
			password: 'password'
		};
		await Register(req, res);
	});

	it('should return an error if the user already exists in the database', async () => {
		const email = 'someemail@gmail.com';
		await db.collection('Users').insertOne({ _id: email });
		req.body = {
			email,
			username: 'John Doe',
			password: 'password123'
		};
		await Register(req, res);
		expect(resStatusSpy.calledOnceWith(400)).to.equal(true);
		// Custom Error from the mock database
		expect(
			resJsonSpy.calledOnceWithExactly({
				error: 'Duplicate key'
			})
		).to.equal(true);
	});

	it('should return a JWT with its expiration date after a successful response', async () => {
		req.body = {
			email: 'someemail@gmail.com',
			username: 'John Doe',
			password: 'password123'
		};
		await Register(req, res);
		expect(resStatusSpy.calledOnceWith(200)).to.equal(true);
		expect(resJsonSpy.calledOnce).to.equal(true);
		expect(resJsonSpy.getCall(0).args[0])
			.to.have.property('token')
			.and.to.be.a('string');
		expect(resJsonSpy.getCall(0).args[0])
			.to.have.property('expires_at')
			.and.to.be.a('number');
	});
});
