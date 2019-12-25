import * as express from 'express';
import * as getListsController from '../../../../controllers/list/getLists';
import * as mock from '../../../mock';

const context = mock.createMockContext();
const [isAuthenticated, getLists] = getListsController.controller(context);

describe('Unit Testing getLists controller', () => {
	const req = ({ body: {} } as unknown) as express.Request;
	const res = (new mock.MockResponse() as unknown) as express.Response;
	jest.spyOn(res, 'status');
	jest.spyOn(res, 'json');
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
	});

	it('should always return with a succesful response with a users todo list', async () => {
		await getLists(req, res, next);
		expect(res.status).lastCalledWith(200);
		expect(res.json).lastCalledWith({
			Main: { items: [], pages: 1 }
		});
	});
});
