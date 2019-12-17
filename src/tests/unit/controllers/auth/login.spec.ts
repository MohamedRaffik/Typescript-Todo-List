import * as express from 'express';
import * as LoginController from '../../../../controllers/auth/login';
import * as mock from '../../../mock';

const context = mock.createMockContext();
const [Login] = LoginController.controller(context);

describe('Unit Testing Login controller', () => {
	const req = ({ body: {} } as unknown) as express.Request;
	const res = (new mock.MockResponse() as unknown) as express.Response;
	jest.spyOn(res, 'status');
	jest.spyOn(res, 'json');
	jest.spyOn(res, 'cookie');
	const { db } = context;

	beforeEach(async () => {
		req.body = {};
		await db.dropCollection('Users');
		((res.status as unknown) as jest.SpyInstance).mockClear();
		((res.json as unknown) as jest.SpyInstance).mockClear();
		((res.cookie as unknown) as jest.SpyInstance).mockClear();
	});

	it('should return an error response if email or password is missing or have incorrect types in the request body', async () => {
		req.body = {};
		await Login(req, res);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "'email' is not specified, 'password' is not specified"
		});

		req.body = {
			email: 10,
			password: 'password123'
		};
		await Login(req, res);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({ error: "'email' value must be of type 'string'" });
	});

	it('should return an error if a user attempts to login with a non existent account', async () => {
		req.body = {
			email: 'someemail@gmail.com',
			password: 'password123'
		};
		await Login(req, res);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: 'Account does not exist with this email'
		});
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
		expect(res.status).lastCalledWith(401);
		expect(res.json).lastCalledWith({
			error: 'Incorrect email or password'
		});
	});

	it('should successfully login a user if they send correct credentials and receive a JWT token', async () => {
		req.body = {
			email: 'someemail@gmail.com',
			password: 'password123'
		};
		const { User } = context;
		await User.create(db, { ...req.body, username: 'John Doe' });
		await Login(req, res);
		expect(res.cookie).lastCalledWith(
			'token',
			expect.any(String),
			expect.objectContaining({ httpOnly: true, secure: true, maxAge: expect.any(Number) })
		);
		expect(res.status).lastCalledWith(200);
		expect(res.json).lastCalledWith(expect.objectContaining({ token: expect.any(String) }));
	});
});
