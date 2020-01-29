import * as express from 'express';
import * as moveTodoController from '../../../../controllers/list/moveTodo';
import * as User from '../../../../models/user';
import * as mock from '../../../mock';

const context = mock.createMockContext();
const [isAuthenticated, moveTodo] = moveTodoController.controller(context);

describe('Unit Testing moveTodo controller', () => {
    const req = ({ body: {} } as unknown) as express.Request;
    const res = (new mock.MockResponse() as unknown) as express.Response;
    jest.spyOn(res, 'status');
    jest.spyOn(res, 'json');
    const next = jest.fn();
    const todo: User.Todo = { title: 'Title', notes: [], created: Date.now() };

    beforeEach(async () => {
        context.db.dropCollection('Users');
        req.body = {};
        const user = await context.User.create(context.db, {
            email: 'someemail@gmail.com',
            username: 'John Doe',
            password: 'password123'
        });
        req.user = user;
        ((res.status as unknown) as jest.SpyInstance).mockClear();
        ((res.json as unknown) as jest.SpyInstance).mockClear();
    });

    it('should return an error response if there are invalid values/types for newList', async () => {
        req.params = { list: 'Main', id: '10' };
        req.body = { newList: 10 };
        await moveTodo(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({
            error: "'newList' value must be of type 'string'"
        });
    });

    it('should return an error response if the newList or list does not exist', async () => {
        req.params = { list: 'TestList', id: '0' };
        req.body = { newList: 'Main', newId: 0 };
        await moveTodo(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({
            error: "'TestList' list does not exist"
        });

        const user = req.user as User.UserClass;
        await user.addTodo('Main', todo);
        req.params = { list: 'Main', id: '0' };
        req.body = { newList: 'TestList', newId: 0 };
        await moveTodo(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({
            error: "'TestList' list does not exist"
        });
    });

    it('should return an error response if the item does not exist in the list', async () => {
        req.params = { list: 'Main', id: '0' };
        req.body = { newList: 'Main' };
        await moveTodo(req, res, next);
        expect(res.status).lastCalledWith(400);
        expect(res.json).lastCalledWith({
            error: "Item does not exist in 'Main' list"
        });
    });

    it('should return a response with the updated todo list when moving an item between lists', async () => {
        const user = req.user as User.UserClass;
        await user.addTodo('Main', { ...todo, title: 'Main' });
        await user.addTodo('Main', { ...todo, title: 'Main1' });
        await user.addTodo('Main', { ...todo, title: 'Main2' });
        await user.addTodo('TestList', { ...todo, title: 'TestList' });
        await user.addTodo('TestList', { ...todo, title: 'TestList1' });
        await user.addTodo('TestList', { ...todo, title: 'TestList2' });
        req.params = { list: 'Main', id: '1' };
        req.body = { newList: 'TestList' };
        await moveTodo(req, res, next);
        expect(res.status).lastCalledWith(200);
        expect(res.json).lastCalledWith({
            TestList: [
                { ...todo, title: 'TestList' },
                { ...todo, title: 'TestList1' },
                { ...todo, title: 'TestList2' },
                { ...todo, title: 'Main1' }
            ]
        });
    });
});
