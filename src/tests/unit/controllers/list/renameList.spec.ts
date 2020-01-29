import express from 'express';
import { controller } from '../../../../controllers/list/renameList';
import { User } from '../../../../models/user';
import { createMockContext, MockResponse } from '../../../mock';

const context = createMockContext();
const [isAuthenticated, renameList] = controller(context);

describe('Unit Testing renameList controller', () => {
    const req = ({ body: {} } as unknown) as express.Request;
    const res = (new MockResponse() as unknown) as express.Response;
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    jest.spyOn(res, 'end');
    const next = jest.fn();

    beforeEach(async () => {
        context.db.dropCollection('Users');
        const user = await context.User.create(context.db, {
            email: 'someemail@gmail.com',
            username: 'John Doe',
            password: 'password123'
        });
        req.user = user;
        req.body = {};
        ((res.status as unknown) as jest.SpyInstance).mockClear();
        ((res.json as unknown) as jest.SpyInstance).mockClear();
        ((res.end as unknown) as jest.SpyInstance).mockClear();
    });

    it('should return an error response if newListName is not in the body', async () => {
        req.body = {};
        req.params = { list: 'TestList' };
        await renameList(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({
            error: "'newListName' is not specified"
        });
    });

    it('should return an error response if the list to be renamed does not exist', async () => {
        req.body = { newListName: '' };
        req.params = { list: 'TestList' };
        await renameList(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({
            error: "'TestList' list does not exist"
        });
    });

    it('should return an error response if the newListName is an empty character string', async () => {
        req.body = { newListName: '' };
        req.params = { list: 'TestList' };
        const user = req.user as User;
        await user.createList('TestList');
        await renameList(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({
            error: "'' is not a valid list name"
        });
    });

    it('should return an error response if the newListName already exists', async () => {
        req.body = { newListName: 'Main' };
        req.params = { list: 'TestList' };
        const user = req.user as User;
        await user.createList('TestList');
        await renameList(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({
            error: "Cannot rename 'TestList' list to 'Main', 'Main' list already exists"
        });
    });

    it('should return a successful response if the list was successfully renamed', async () => {
        req.body = { newListName: 'RenamedList' };
        req.params = { list: 'TestList' };
        const user = req.user as User;
        await user.createList('TestList');
        await renameList(req, res, next);
        expect(res.status).lastCalledWith(200);
        expect(res.end).toBeCalled();
    });
});
