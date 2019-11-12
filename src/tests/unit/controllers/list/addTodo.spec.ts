import { expect } from 'chai';
import { Request, Response } from 'express';
import sinon from 'sinon';
import addTodoController from '../../../../controllers/list/addTodo';
import createMockContext, { MockResponse } from '../../mock';

const context = createMockContext();
const [isAuthenticated, addTodo] = addTodoController(context);

describe('Unit Testing addTodo controller', () => {
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

	it('should return an error response if the fields are invalid', async () => {
		req.body = { title: 'My First Item' };
		req.params = { list: 'Master' };
		await addTodo(req, res, next);

		req.body = { ...req.body, notes: [10, 'note1'] };
		await addTodo(req, res, next);

		expect(resStatusSpy.calledTwice).to.equal(true);
		expect(resStatusSpy.alwaysCalledWith(400)).to.equal(true);
		expect(resJsonSpy.calledTwice).to.equal(true);
		expect(resJsonSpy.getCall(0).args[0]).to.deep.equal({
			error: "'notes' is not specified"
		});
		expect(resJsonSpy.getCall(1).args[0]).to.deep.equal({
			error: "Values of '[ 10, note1 ]' must be of type 'string'"
		});
	});

	it('should return an response with the updated list information', async () => {
		req.body = {
			title: 'My First Item',
			notes: ['note1', 'note2'],
			created: Date.now()
		};
		await addTodo(req, res, next);
		expect(resStatusSpy.calledOnceWith(200)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				id: 0,
				title: req.body.title,
				notes: req.body.notes,
				created: req.body.created,
				completed: false
			})
		).to.equal(true);
	});
});
