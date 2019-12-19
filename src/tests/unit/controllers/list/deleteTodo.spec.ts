import * as express from 'express';
import * as deleteTodoController from '../../../../controllers/list/deleteTodo';
import * as User from '../../../../models/user';
import * as mock from '../../../mock';

const context = mock.createMockContext();
const [isAuthenticated, deleteTodo] = deleteTodoController.controller(context);

describe('Unit Testing deleteTodo controller', () => {
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

	it('should return an error response if the list does not exist', async () => {
		req.params = { list: 'School', id: String(100) };
		await deleteTodo(req, res, next);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "'School' list does not exist"
		});
	});

	it('should return an error message if the item does not exist', async () => {
		req.params = { list: 'Main', id: String(100) };
		await deleteTodo(req, res, next);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "Item does not exist in 'Main' list"
		});
	});

	it('should return a successful response if the item was successfully deleted', async () => {
		req.params = { list: 'Main', id: String(0) };
		const user = req.user as User.UserClass;
		await user.addTodo('Main', { title: 'A', notes: [], created: Date.now() });
		await deleteTodo(req, res, next);
		expect(res.status).lastCalledWith(200);
		expect(res.end).toBeCalled();
	});
});
