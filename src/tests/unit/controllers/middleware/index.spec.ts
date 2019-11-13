import * as express from 'express';
import * as jwt from 'jsonwebtoken';
import * as middleware from '../../../../controllers/middleware';
import * as User from '../../../../models/user';
import * as mock from '../../../mock';

const context = mock.createMockContext();
const { isAuthenticated } = middleware.create(context);

describe('Unit Testing middleware functions', () => {
	const req = ({ body: {}, headers: {} } as unknown) as express.Request;
	const res = (new mock.MockResponse() as unknown) as express.Response;
	jest.spyOn(res, 'status');
	jest.spyOn(res, 'json');
	const next = jest.fn();

	beforeEach(async () => {
		req.body = {};
		((res.status as unknown) as jest.SpyInstance).mockClear();
		((res.json as unknown) as jest.SpyInstance).mockClear();
		next.mockClear();
	});

	describe('testing isAuthenticated middleware', () => {
		const info: User.Info = {
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
			expect(res.status).lastCalledWith(401);
			expect(res.json).lastCalledWith({
				error: 'Authorization Header not provided'
			});
			expect(next).toBeCalledTimes(0);
		});

		it('should return an error response if the authorization type is not bearer', async () => {
			req.headers.authorization = `Bearreer`;
			await isAuthenticated(req, res, next);
			expect(res.status).lastCalledWith(401);
			expect(res.json).lastCalledWith({
				error: 'Incorrect Token Type, must be Bearer'
			});
			expect(next).toBeCalledTimes(0);
		});

		it('should return an error response if the token is not valid', async () => {
			req.headers.authorization = 'Bearer 123InvalidToken';
			await isAuthenticated(req, res, next);
			expect(res.status).lastCalledWith(401);
			expect(res.json).lastCalledWith({
				error: 'JWT Token is invalid'
			});
			expect(next).toBeCalledTimes(0);
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
			expect(res.status).lastCalledWith(401);
			expect(res.json).lastCalledWith({
				error: 'JWT Token is expired'
			});
			expect(next).toBeCalledTimes(0);
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
			expect(res.status).lastCalledWith(401);
			expect(res.json).lastCalledWith({
				error: 'Account not Found'
			});
			expect(next).toBeCalledTimes(0);
		});

		it('should set user in the request object with a valid token', async () => {
			await context.User.create(context.db, info);
			req.headers.authorization = `Bearer ${token}`;
			await isAuthenticated(req, res, next);
			expect(res.status).toBeCalledTimes(0);
			expect(res.json).toBeCalledTimes(0);
			expect(next).toBeCalledTimes(1);
			expect(req.user).toEqual(await context.User.get(context.db, info.email));
		});
	});
});
