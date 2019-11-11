import { expect } from 'chai';
import { Request, Response } from 'express';
import sinon from 'sinon';
import deleteTodoController from '../../../../controllers/list/deleteTodo';
import createMockContext, { MockResponse } from '../../mock';

const context = createMockContext();
const [isAuthenticated, deleteTodo] = deleteTodoController(context);

describe('Unit Testing deleteTodo controller', () => {
	const req = ({ body: {} } as unknown) as Request;
	const res = (new MockResponse() as unknown) as Response;
	const resStatusSpy = sinon.spy(res, 'status');
	const resJsonSpy = sinon.spy(res, 'json');
	const next = sinon.stub();
	const { db, User } = context;

	before(async () => {
		const user = await User.create(db, {
			email: 'someemail@gmail.com',
			username: 'John Doe',
			password: 'password123'
		});
		req.user = user;
	});

	beforeEach(async () => {
		req.body = {};
		resStatusSpy.resetHistory();
		resJsonSpy.resetHistory();
	});

	it('should return an error response if the list does not exist', async () => {
		req.params = { list: 'School', id: String(100) };
		await deleteTodo(req, res, next);
		expect(resStatusSpy.calledOnceWith(400)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				error: "'School' list does not exist"
			})
		).to.equal(true);
	});

	it('should return an error message if the item does not exist', async () => {
		req.params = { list: 'Master', id: String(100) };
		await deleteTodo(req, res, next);
		expect(resStatusSpy.calledOnceWith(400)).to.equal(true);
		expect(
			resJsonSpy.alwaysCalledWithExactly({
				error: "Item does not exist in 'Master' list"
			})
		).to.equal(true);
	});

	it('should return a successful response if the item was successfully deleted', async () => {
		req.params = { list: 'Master', id: String(0) };
		if (req.user) {
			await req.user.addTodo('Master', { title: 'A', notes: [], created: Date.now() });
		}
		await deleteTodo(req, res, next);
		expect(resStatusSpy.calledOnceWith(200)).to.equal(true);
		expect(resJsonSpy.notCalled).to.equal(true);
	});
});
