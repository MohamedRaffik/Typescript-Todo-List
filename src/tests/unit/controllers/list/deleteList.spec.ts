import { expect } from 'chai';
import { Request, Response } from 'express';
import sinon from 'sinon';
import deleteListController from '../../../../controllers/list/deleteList';
import createMockContext, { MockResponse } from '../../mock';

const context = createMockContext();
const [isAuthenticated, deleteList] = deleteListController(context);

describe('Unit Testing deleteList controller', () => {
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

	it('should return an error if the list does not exist', async () => {
		req.params = { list: 'School' };
		await deleteList(req, res, next);
		expect(resStatusSpy.calledOnceWith(400)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				error: "'School' list does not exist"
			})
		).to.equal(true);
		expect(next.notCalled).to.equal(true);
	});

	it('should return an error if the Master is attempted to be deleted', async () => {
		req.params = { list: 'Master' };
		await deleteList(req, res, next);
		expect(resStatusSpy.calledOnceWith(400)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				error: "Cannot delete 'Master' list"
			})
		).to.equal(true);
		expect(next.notCalled).to.equal(true);
	});

	it('should return a successful response after successfully deleting the list', async () => {
		if (req.user) {
			await req.user.addTodo('School', { title: 'A', notes: [], created: Date.now() });
		}
		req.params = { list: 'School' };
		await deleteList(req, res, next);
		expect(resStatusSpy.calledOnceWith(200)).to.equal(true);
		expect(resJsonSpy.notCalled).to.equal(true);
		expect(next.notCalled).to.equal(true);
	});
});
