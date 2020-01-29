import * as express from 'express';
import * as getListController from '../../../../controllers/list/getList';
import * as mock from '../../../mock';

const context = mock.createMockContext();
const [isAuthenticated, getList] = getListController.controller(context);

describe('Unit Testing getList controller', () => {
    const req = ({ body: {}, params: {} } as unknown) as express.Request;
    const res = (new mock.MockResponse() as unknown) as express.Response;
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
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
        req.params = {};
        ((res.status as unknown) as jest.SpyInstance).mockClear();
        ((res.json as unknown) as jest.SpyInstance).mockClear();
    });

    it('should return an error response if the list does not exist', async () => {
        req.params = { list: 'TestList', page: '1' };
        await getList(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({
            error: "'TestList' list does not exist"
        });
    });

    it('should return the todo list', async () => {
        req.params = { list: 'Main' };
        await getList(req, res, next);
        expect(res.status).lastCalledWith(200);
        expect(res.json).lastCalledWith({
            Main: []
        });
    });
});
