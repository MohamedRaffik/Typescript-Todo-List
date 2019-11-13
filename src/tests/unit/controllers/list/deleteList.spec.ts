import * as express from 'express';
import * as deleteListController from '../../../../controllers/list/deleteList';
import * as User from '../../../../models/user';
import * as mock from '../../../mock';

const context = mock.createMockContext();
const [isAuthenticated, deleteList] = deleteListController.controller(context);

describe('Unit Testing deleteList controller', () => {
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

	it('should return an error if the list does not exist', async () => {
		req.params = { list: 'School' };
		await deleteList(req, res, next);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "'School' list does not exist"
		});
	});

	it('should return an error if the Master is attempted to be deleted', async () => {
		req.params = { list: 'Master' };
		await deleteList(req, res, next);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "Cannot delete 'Master' list"
		});
	});

	it('should return a successful response after successfully deleting the list', async () => {
		const user = req.user as User.UserClass;
		await user.addTodo('School', { title: 'A', notes: [], created: Date.now() });
		req.params = { list: 'School' };
		await deleteList(req, res, next);
		expect(res.status).lastCalledWith(200);
		expect(res.json).toBeCalledTimes(0);
	});
});
