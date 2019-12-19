import * as express from 'express';
import * as updateTodoController from '../../../../controllers/list/updateTodo';
import * as User from '../../../../models/user';
import * as mock from '../../../mock';

const context = mock.createMockContext();
const [isAuthenticated, updateTodo] = updateTodoController.controller(context);

describe('Unit Testing updateTodo controller', () => {
	const req = ({ body: {} } as unknown) as express.Request;
	const res = (new mock.MockResponse() as unknown) as express.Response;
	jest.spyOn(res, 'status');
	jest.spyOn(res, 'json');
	const next = jest.fn();
	const todo: User.Todo = {
		title: 'Item',
		notes: [],
		created: Date.now(),
		completed: false
	};

	beforeEach(async () => {
		await context.db.dropCollection('Users');
		req.body = {};
		const user = await context.User.create(context.db, {
			email: 'someemail@gmail.com',
			username: 'John Doe',
			password: 'password123'
		});
		await user.addTodo('Main', todo);
		req.user = user;
		((res.status as unknown) as jest.SpyInstance).mockClear();
		((res.json as unknown) as jest.SpyInstance).mockClear();
	});

	it('should return an error if there are invalid types in the body of the request', async () => {
		req.body = { title: 10, notes: [10], completed: 0 };
		req.params = { list: 'Main', id: '100' };
		await updateTodo(req, res, next);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error:
				"'title' value must be of type 'string', 'completed' value must be of type 'boolean', Values of '[ 10 ]' must be of type 'string'"
		});
	});

	it('should return an error response if the list does not exist', async () => {
		req.body = { title: 'Updated Item' };
		req.params = { list: 'Mister', id: '1' };
		await updateTodo(req, res, next);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "'Mister' list does not exist"
		});
	});

	it('should return an error response if the item does not exist', async () => {
		req.body = { title: 'Updated Item' };
		req.params = { list: 'Main', id: '1' };
		await updateTodo(req, res, next);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "Item does not exist in 'Main' list"
		});
	});

	it('should return a successful response with the updated item', async () => {
		req.body = { title: 'Updated Item', completed: true };
		req.params = { list: 'Main', id: '0' };
		await updateTodo(req, res, next);
		expect(res.status).lastCalledWith(200);
		expect(res.json).lastCalledWith({
			...todo,
			title: 'Updated Item',
			completed: true,
			id: 0
		});
	});

	it('should return the unchanged item if there are no values that need to be updated', async () => {
		req.body = {};
		req.params = { list: 'Main', id: '0' };
		await updateTodo(req, res, next);
		expect(res.status).lastCalledWith(200);
		expect(res.json).lastCalledWith({
			...todo,
			id: 0
		});
	});
});
