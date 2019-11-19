import * as express from 'express';
import * as moveTodoController from '../../../../controllers/list/moveTodo';
import * as User from '../../../../models/user';
import * as mock from '../../../mock';

const context = mock.createMockContext();
const [isAuthenticated, moveTodo] = moveTodoController.controller(context);

describe('Unit Testing moveTodo controller', () => {
	const req = ({ body: {} } as unknown) as express.Request;
	const res = (new mock.MockResponse() as unknown) as express.Response;
	jest.spyOn(res, 'status');
	jest.spyOn(res, 'json');
	const next = jest.fn();
	const todo: User.Todo = { title: 'Title', notes: [], created: Date.now() };

	beforeEach(async () => {
		context.db.dropCollection('Users');
		req.body = {};
		const user = await context.User.create(context.db, {
			email: 'someemail@gmail.com',
			username: 'John Doe',
			password: 'password123'
		});
		req.user = user;
		((res.status as unknown) as jest.SpyInstance).mockClear();
		((res.json as unknown) as jest.SpyInstance).mockClear();
	});

	it('should return an error response if there are invalid values/types for newList and newId', async () => {
		req.params = { list: 'Master', id: '10' };
		req.body = { newList: 10 };
		await moveTodo(req, res, next);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "'newList' value must be of type 'string', 'newId' is not specified"
		});
	});

	it('should return an error response if the newList or list does not exist', async () => {
		req.params = { list: 'TestList', id: '0' };
		req.body = { newList: 'Master', newId: 0 };
		await moveTodo(req, res, next);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "'TestList' list does not exist"
		});

		const user = req.user as User.UserClass;
		await user.addTodo('Master', todo);
		req.params = { list: 'Master', id: '0' };
		req.body = { newList: 'TestList', newId: 0 };
		await moveTodo(req, res, next);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "'TestList' list does not exist"
		});
	});

	it('should return an error response if the item does not exist in the list', async () => {
		req.params = { list: 'Master', id: '0' };
		req.body = { newList: 'Master', newId: 0 };
		await moveTodo(req, res, next);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "Item does not exist in 'Master' list"
		});
	});

	it('should return an error response if the newId position is not a valid number', async () => {
		const user = req.user as User.UserClass;
		await user.addTodo('Master', todo);
		req.params = { list: 'Master', id: '0' };
		req.body = { newList: 'Master', newId: -1 };
		await moveTodo(req, res, next);
		expect(res.status).lastCalledWith(400);
		expect(res.json).lastCalledWith({
			error: "Cannot move item to the 'Master' list at position -1"
		});
	});

	it('should return a response with the updated lists after moving a todo item between lists', async () => {
		const user = req.user as User.UserClass;
		await user.addTodo('Master', { ...todo, title: 'Master' });
		await user.addTodo('Master', { ...todo, title: 'Master1' });
		await user.addTodo('Master', { ...todo, title: 'Master2' });
		await user.addTodo('TestList', { ...todo, title: 'TestList' });
		await user.addTodo('TestList', { ...todo, title: 'TestList1' });
		await user.addTodo('TestList', { ...todo, title: 'TestList2' });
		req.params = { list: 'Master', id: '1' };
		req.body = { newList: 'TestList', newId: 1 };
		await moveTodo(req, res, next);
		expect(res.status).lastCalledWith(200);
		expect(res.json).lastCalledWith({
			Master: [
				{
					...todo,
					id: 0,
					title: 'Master',
					completed: false
				},
				{
					...todo,
					id: 1,
					title: 'Master2',
					completed: false
				}
			],
			TestList: [
				{
					...todo,
					id: 0,
					title: 'TestList',
					completed: false
				},
				{
					...todo,
					id: 1,
					title: 'Master1',
					completed: false
				},
				{
					...todo,
					id: 2,
					title: 'TestList1',
					completed: false
				},
				{
					...todo,
					id: 3,
					title: 'TestList2',
					completed: false
				}
			]
		});
	});

	it('should return a response with the updated list after moving a todo item within a list', async () => {
		const user = req.user as User.UserClass;
		await user.addTodo('Master', { ...todo, title: 'Master' });
		await user.addTodo('Master', { ...todo, title: 'Master1' });
		await user.addTodo('Master', { ...todo, title: 'Master2' });
		req.params = { list: 'Master', id: '2' };
		req.body = { newList: 'Master', newId: 0 };
		await moveTodo(req, res, next);
		expect(res.status).lastCalledWith(200);
		expect(res.json).lastCalledWith({
			Master: [
				{
					...todo,
					id: 0,
					title: 'Master2',
					completed: false
				},
				{
					...todo,
					id: 1,
					title: 'Master',
					completed: false
				},
				{
					...todo,
					id: 2,
					title: 'Master1',
					completed: false
				}
			]
		});
	});

	it('should return a response with the updated list after moving the item to a position greater than the list size to the end of the list', async () => {
		const user = req.user as User.UserClass;
		await user.addTodo('Master', { ...todo, title: 'Master' });
		await user.addTodo('Master', { ...todo, title: 'Master1' });
		await user.addTodo('Master', { ...todo, title: 'Master2' });
		req.params = { list: 'Master', id: '0' };
		req.body = { newList: 'Master', newId: 20 };
		await moveTodo(req, res, next);
		expect(res.status).lastCalledWith(200);
		expect(res.json).lastCalledWith({
			Master: [
				{
					...todo,
					id: 0,
					title: 'Master1',
					completed: false
				},
				{
					...todo,
					id: 1,
					title: 'Master2',
					completed: false
				},
				{
					...todo,
					id: 2,
					title: 'Master',
					completed: false
				}
			]
		});
	});
});
