import express from 'express';
import { controller } from '../../../../controllers/list/clearList';
import { createMockContext, MockResponse } from '../../../mock';

const context = createMockContext();
const [isAuthenticated, clearList] = controller(context);

describe('Unit Testing clearList controller', () => {
    const req = ({ body: {} } as unknown) as express.Request;
    const res = (new MockResponse() as unknown) as express.Response;
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    const next = jest.fn();
    const { db, User } = context;

    beforeAll(async () => {
        const user = await User.create(db, {
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

    it('should return an error response if the list does not exist', async () => {
        req.params = { list: 'School' };
        await clearList(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({
            error: "'School' list does not exist"
        });
    });

    it('should return the updated list with a successful response', async () => {
        req.params = { list: 'Main' };
        await clearList(req, res, next);
        expect(res.status).lastCalledWith(200);
        expect(res.json).lastCalledWith({
            Main: []
        });
    });
});
