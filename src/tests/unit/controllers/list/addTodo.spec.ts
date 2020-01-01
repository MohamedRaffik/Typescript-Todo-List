import * as express from 'express';
import * as addTodoController from '../../../../controllers/list/addTodo';
import * as mock from '../../../mock';

const context = mock.createMockContext();
const [isAuthenticated, addTodo] = addTodoController.controller(context);

describe('Unit Testing addTodo controller', () => {
    const req = ({ body: {} } as unknown) as express.Request;
    const res = (new mock.MockResponse() as unknown) as express.Response;
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

    it('should return an error response if the fields are invalid', async () => {
        req.body = { title: 'My First Item' };
        req.params = { list: 'Main' };
        await addTodo(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({ error: "'notes' is not specified" });

        req.body = { ...req.body, notes: [10, 'note1'] };
        await addTodo(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({
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
        expect(res.status).lastCalledWith(200);
        expect(res.json).lastCalledWith({
            id: 0,
            title: req.body.title,
            notes: req.body.notes,
            created: req.body.created,
            completed: false
        });
    });
});
