import * as express from 'express';
import * as createListController from '../../../../controllers/list/createList';
import * as User from '../../../../models/user';
import * as mock from '../../../mock';

const context = mock.createMockContext();
const [isAuthenticated, createList] = createListController.controller(context);

describe('Unit Testing createList controller', () => {
	const req = ({ body: {} } as unknown) as express.Request;
	const res = (new mock.MockResponse() as unknown) as express.Response;
	jest.spyOn(res, 'status');
	jest.spyOn(res, 'json');
	jest.spyOn(res, 'end');
	const next = jest.fn();

	beforeAll(async () => {
		const user = await context.User.create(context.db, {
			email: 'someemail@gmail.com',
			username: 'John Doe',
			password: 'password123'
		});
		req.user = user;
	});

	beforeEach(async () => {
		req.body = {};
		((res.status as unknown) as jest.SpyInstance).mockClear();
		((res.json as unknown) as jest.SpyInstance).mockClear();
		((res.end as unknown) as jest.SpyInstance).mockClear();
	});

	it('should return an error response if the list to be created already exists', async () => {
		req.params = { list: 'Master' };
		await createList(req, res, next);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "'Master' list already exists"
		});
	});

	it('should return with a successful response after creating the list', async () => {
		req.params = { list: 'NewList' };
		await createList(req, res, next);
		expect(res.status).lastCalledWith(200);
		expect(res.end).toBeCalled();
		const user = req.user as User.UserClass;
		expect(user.lists['NewList']).toEqual([]);
	});
});
