import express from 'express';
import { Context } from '../../context';
import { User, Todo } from '../../models/user';
import { middleware } from '../middleware';
import { validateArray, validateFields } from '../utils';

interface AddTodoBody {
    title: string;
    notes: string[];
    created: number;
    completed: boolean;
}

export const controller = (context: Context) => {
    const { isAuthenticated } = middleware(context);
    const addTodo = async (req: express.Request, res: express.Response) => {
        const body = req.body as AddTodoBody;
        const { list } = req.params;
        let error = validateFields(body, {
            list: { type: 'string', default: 'Main' },
            notes: {},
            completed: { type: 'boolean', default: false }
        });
        if (error) {
            return res.status(400).json({ error });
        }
        error = validateArray(body.notes, { type: 'string' });
        if (error) {
            return res.status(400).json({ error });
        }
        const user = req.user as User;
        const newTodo: Todo = {
            title: body.title,
            notes: body.notes,
            created: body.created,
            completed: body.completed
        };
        try {
            await user.addTodo(list, newTodo);
            const response = { [list]: user.getList(list) };
            return res.status(200).json(response);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    return [isAuthenticated, addTodo];
};
