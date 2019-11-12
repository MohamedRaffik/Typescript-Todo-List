import { expect } from 'chai';
import { Request, Response } from 'express';
import sinon from 'sinon';
import updateTodoController from '../../../../controllers/list/updateTodo';
import { Todo } from '../../../../models/user';
import createMockContext, { MockResponse } from '../../mock';

const context = createMockContext();
const [isAuthenticated, updateTodo] = updateTodoController(context);

describe('Unit Testing updateTodo controller', () => {
	const req = ({ body: {} } as unknown) as Request;
	const res = (new MockResponse() as unknown) as Response;
	const resStatusSpy = sinon.spy(res, 'status');
	const resJsonSpy = sinon.spy(res, 'json');
	const next = sinon.stub();
	const { db, User } = context;
	const todo: Todo = {
		title: 'Item',
		notes: [],
		created: Date.now(),
		completed: false
	};

	before(async () => {
		const user = await User.create(db, {
			email: 'someemail@gmail.com',
			username: 'John Doe',
			password: 'password123'
		});
		await user.addTodo('Master', todo);
		req.user = user;
	});

	beforeEach(async () => {
		req.body = {};
		resStatusSpy.resetHistory();
		resJsonSpy.resetHistory();
	});

	it('should return an error if there are invalid types in the body of the request', async () => {
		req.body = { title: 10 };
		req.params = { list: 'Master', id: String(100) };
		await updateTodo(req, res, next);
		expect(resStatusSpy.calledOnceWith(400)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				error: "'title' value must be of type 'string'"
			})
		).to.equal(true);
	});

	it('should return an error response if the list does not exist', async () => {
		req.body = { title: 'Updated Item' };
		req.params = { list: 'Mister', id: String(1) };
		await updateTodo(req, res, next);
		expect(resStatusSpy.calledOnceWithExactly(400)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				error: "'Mister' list does not exist"
			})
		).to.equal(true);
	});

	it('should return an error response if the item does not exist', async () => {
		req.body = { title: 'Updated Item' };
		req.params = { list: 'Master', id: String(1) };
		await updateTodo(req, res, next);
		expect(resStatusSpy.calledOnceWith(400)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				error: "Item does not exist in 'Master' list"
			})
		).to.equal(true);
	});

	it('should return a successful response with the updated item', async () => {
		req.body = { title: 'Updated Item', completed: true };
		req.params = { list: 'Master', id: String(0) };
		await updateTodo(req, res, next);
		expect(resStatusSpy.calledOnceWith(200)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				...todo,
				title: 'Updated Item',
				completed: true,
				id: 0
			})
		).to.equal(true);
	});
});
