import { expect } from 'chai';
import { Request, Response } from 'express';
import sinon from 'sinon';
import getListsController from '../../../../controllers/list/getLists';
import createMockContext, { MockResponse } from '../../mock';

const context = createMockContext();
const [isAuthenticated, getLists] = getListsController(context);

describe('Unit Testing getLists controller', () => {
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

	it('should always return with a succesful response with a users todo list', async () => {
		await getLists(req, res, next);
		expect(resStatusSpy.calledOnceWith(200)).to.equal(true);
		expect(
			resJsonSpy.calledOnceWithExactly({
				Master: []
			})
		).to.equal(true);
	});
});
