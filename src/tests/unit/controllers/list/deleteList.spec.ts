import express from 'express';
import { controller } from '../../../../controllers/list/deleteList';
import { User } from '../../../../models/user';
import { createMockContext, MockResponse } from '../../../mock';

const context = createMockContext();
const [isAuthenticated, deleteList] = controller(context);

describe('Unit Testing deleteList controller', () => {
    const req = ({ body: {} } as unknown) as express.Request;
    const res = (new MockResponse() as unknown) as express.Response;
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

    it('should return an error if the list does not exist', async () => {
        req.params = { list: 'School' };
        await deleteList(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({
            error: "'School' list does not exist"
        });
    });

    it('should return an error if the Main is attempted to be deleted', async () => {
        req.params = { list: 'Main' };
        await deleteList(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({
            error: "Cannot delete 'Main' list"
        });
    });

    it('should return a successful response after successfully deleting the list', async () => {
        const user = req.user as User;
        await user.addTodo('School', { title: 'A', notes: [], created: Date.now() });
        req.params = { list: 'School' };
        await deleteList(req, res, next);
        expect(res.status).lastCalledWith(200);
        expect(res.end).toBeCalled();
    });
});
