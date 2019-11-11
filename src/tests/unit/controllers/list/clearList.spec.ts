import { expect } from 'chai';
import { Request, Response } from 'express';
import sinon from 'sinon';
import clearListController from '../../../../controllers/list/clearList';
import createMockContext, { MockResponse } from '../../mock';

const context = createMockContext();
const [isAuthenticated, clearList] = clearListController(context);

describe('Unit Testing clearList controller', () => {
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

	it('should throw in error if the list does not exist', async () => {
		req.params = { list: 'School' };
		await clearList(req, res, next);
		expect(resStatusSpy.calledOnceWith(400)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				error: "'School' list does not exist"
			})
		).to.equal(true);
		expect(next.notCalled).to.equal(true);
	});

	it('should return the updated list with a successful response', async () => {
		req.params = { list: 'Master' };
		await clearList(req, res, next);
		expect(resStatusSpy.calledOnceWith(200)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				list: 'Master',
				items: []
			})
		).to.equal(true);
		expect(next.notCalled).to.equal(true);
	});
});
