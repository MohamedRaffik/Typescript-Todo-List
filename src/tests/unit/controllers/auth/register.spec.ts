import * as express from 'express';
import * as RegisterController from '../../../../controllers/auth/register';
import * as mock from '../../../mock';

const context = mock.createMockContext();
const [Register] = RegisterController.controller(context);

describe('Unit Testing Register controller', () => {
	const req = ({ body: {} } as unknown) as express.Request;
	const res = (new mock.MockResponse() as unknown) as express.Response;
	jest.spyOn(res, 'status');
	jest.spyOn(res, 'json');
	jest.spyOn(res, 'cookie');
	const { db } = context;

	beforeEach(async () => {
		req.body = {};
		db.dropCollection('Users');
		((res.status as unknown) as jest.SpyInstance).mockClear();
		((res.json as unknown) as jest.SpyInstance).mockClear();
		((res.cookie as unknown) as jest.SpyInstance).mockClear();
	});

	it('should return an error if there is a missing email, username, or password', async () => {
		await Register(req, res);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error:
				"'email' is not specified, 'password' is not specified, 'username' is not specified"
		});
	});

	it('should return an error if a field has an incorrect type', async () => {
		req.body = {
			email: 10,
			password: 'password123',
			username: 'John Doe'
		};
		await Register(req, res);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "'email' value must be of type 'string'"
		});
	});

	it('should return an error if the password length is shorter than 8 characters', async () => {
		req.body = {
			email: 'someemail@gmail.com',
			username: 'John Doe',
			password: 'password'
		};
		await Register(req, res);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: 'Password length is too short, must be greater than 8 characters'
		});
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
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: 'Duplicate key'
		});
	});

	it('should return a JWT with its expiration date after a successful response', async () => {
		req.body = {
			email: 'someemail@gmail.com',
			username: 'John Doe',
			password: 'password123'
		};
		await Register(req, res);
		expect(res.cookie).lastCalledWith(
			'token',
			expect.any(String),
			expect.objectContaining({ httpOnly: true, secure: true, maxAge: expect.any(Number) })
		);
		expect(res.status).lastCalledWith(200);
		expect(res.json).lastCalledWith(expect.objectContaining({ token: expect.any(String) }));
	});
});
