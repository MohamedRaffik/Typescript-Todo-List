import { expect } from 'chai';
import { Request, Response } from 'express';
import sinon from 'sinon';
import LoginController from '../../../../controllers/auth/login';
import createMockContext, { MockResponse } from '../../mock';

const context = createMockContext();
const [Login] = LoginController(context);

describe('Unit Testing Login controller', () => {
	const req = ({ body: {} } as unknown) as Request;
	const res = (new MockResponse() as unknown) as Response;
	const resStatusSpy = sinon.spy(res, 'status');
	const resJsonSpy = sinon.spy(res, 'json');
	const { db } = context;

	beforeEach(async () => {
		req.body = {};
		await db.dropCollection('Users');
		resStatusSpy.resetHistory();
		resJsonSpy.resetHistory();
	});

	it('should return an error response if email or password is missing or have incorrect types in the request body', async () => {
		req.body = {};
		await Login(req, res);

		req.body = {
			email: 10,
			password: 'password123'
		};
		await Login(req, res);

		expect(resStatusSpy.calledTwice).to.equal(true);
		expect(resStatusSpy.alwaysCalledWith(400)).to.equal(true);
		expect(resJsonSpy.calledTwice).to.equal(true);
		expect(resJsonSpy.getCall(0).args[0]).to.deep.equal({
			error: "'email' is not specified, 'password' is not specified"
		});
		expect(resJsonSpy.getCall(1).args[0]).to.deep.equal({
			error: "'email' value must be of type 'string'"
		});
	});

	it('should return an error if a user attempts to login with a non existent account', async () => {
		req.body = {
			email: 'someemail@gmail.com',
			password: 'password123'
		};
		await Login(req, res);
		expect(resStatusSpy.calledOnceWith(400)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				error: 'Account does not exist with this email'
			})
		).to.equal(true);
	});

	it('should return an error if the user entered an incorrect password', async () => {
		req.body = {
			email: 'someemail@gmail.com',
			password: 'password13'
		};
		const { User } = context;
		await User.create(db, {
			email: req.body.email,
			password: 'password123',
			username: 'John Doe'
		});
		await Login(req, res);
		expect(resStatusSpy.calledOnceWith(401)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				error: 'Incorrect email or password'
			})
		).to.equal(true);
	});

	it('should successfully login a user if they send correct credentials and receive a JWT token', async () => {
		req.body = {
			email: 'someemail@gmail.com',
			password: 'password123'
		};
		const { User } = context;
		await User.create(db, { ...req.body, username: 'John Doe' });
		await Login(req, res);
		expect(resStatusSpy.calledOnceWithExactly(200)).to.equal(true);
		expect(resJsonSpy.calledOnce).to.equal(true);
		expect(resJsonSpy.getCall(0).args[0])
			.to.have.property('token')
			.and.to.be.a('string');
		expect(resJsonSpy.getCall(0).args[0])
			.to.have.property('expires_at')
			.and.to.be.a('number');
	});
});
