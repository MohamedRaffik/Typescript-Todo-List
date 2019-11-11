import { expect } from 'chai';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import sinon from 'sinon';
import middleware from '../../../../controllers/middleware';
import createMockContext, { MockResponse } from '../../mock';

const context = createMockContext();
const { isAuthenticated } = middleware(context);

describe('Unit Testing middleware functions', () => {
	const req = ({ body: {}, headers: {} } as unknown) as Request;
	const res = (new MockResponse() as unknown) as Response;
	const resStatusSpy = sinon.spy(res, 'status');
	const resJsonSpy = sinon.spy(res, 'json');
	const next = sinon.stub();
	const { User, db } = context;

	beforeEach(async () => {
		req.body = {};
		resStatusSpy.resetHistory();
		resJsonSpy.resetHistory();
		next.resetHistory();
	});

	describe('testing isAuthenticated middleware', () => {
		const info = {
			email: 'someemail@gmail.com',
			password: 'password123',
			username: 'John Doe'
		};
		const payload = {
			email: info.email,
			expires_at: Date.now() + 3600000
		};
		const token = jwt.sign(payload, String(process.env.SECRET_KEY));

		it('should return an error response if no authorization header exists', async () => {
			await isAuthenticated(req, res, next);
			expect(resStatusSpy.calledOnceWith(401)).to.equal(true);
			expect(
				resJsonSpy.calledOnceWithExactly({
					error: 'Authorization Header not provided'
				})
			).to.equal(true);
			expect(next.notCalled).to.equal(true);
		});

		it('should return an error response if the authorization type is not bearer', async () => {
			req.headers.authorization = `Bearreer`;
			await isAuthenticated(req, res, next);
			expect(resStatusSpy.calledOnceWith(401)).to.equal(true);
			expect(
				resJsonSpy.calledOnceWithExactly({
					error: 'Incorrect Token Type, must be Bearer'
				})
			).to.equal(true);
			expect(next.notCalled).to.equal(true);
		});

		it('should return an error response if the token is not valid', async () => {
			req.headers.authorization = 'Bearer 123InvalidToken';
			await isAuthenticated(req, res, next);
			expect(resStatusSpy.calledOnceWith(401)).to.equal(true);
			expect(
				resJsonSpy.calledOnceWithExactly({
					error: 'JWT Token is invalid'
				})
			).to.equal(true);
			expect(next.notCalled).to.equal(true);
		});

		it('should return an error response if the token is expired', async () => {
			const expiredToken = jwt.sign(
				{
					...payload,
					expires_at: Date.now() - 60000
				},
				String(process.env.SECRET_KEY)
			);
			req.headers.authorization = `Bearer ${expiredToken}`;
			await isAuthenticated(req, res, next);
			expect(resStatusSpy.calledOnceWith(401)).to.equal(true);
			expect(
				resJsonSpy.calledOnceWithExactly({
					error: 'JWT Token is expired'
				})
			).to.equal(true);
			expect(next.notCalled).to.equal(true);
		});

		it('should return an error response if the token has a non existent user', async () => {
			const unknownToken = jwt.sign(
				{
					...payload,
					email: 'unknown@gmail.com'
				},
				String(process.env.SECRET_KEY)
			);
			req.headers.authorization = `Bearer ${unknownToken}`;
			await isAuthenticated(req, res, next);
			expect(resStatusSpy.calledOnceWith(401)).to.equal(true);
			expect(
				resJsonSpy.calledOnceWithExactly({
					error: 'Account not Found'
				})
			).to.equal(true);
			expect(next.notCalled).to.equal(true);
		});

		it('should set user in the request object with a valid token', async () => {
			await User.create(db, info);
			req.headers.authorization = `Bearer ${token}`;
			await isAuthenticated(req, res, next);
			expect(resStatusSpy.notCalled).to.equal(true);
			expect(resJsonSpy.notCalled).to.equal(true);
			expect(next.calledOnce).to.equal(true);
			expect(req).to.have.property('user');
			expect(req.user).to.deep.equal(await User.get(db, info.email));
		});
	});
});
