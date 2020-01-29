import * as express from 'express';
import * as Context from '../../context';
import * as User from '../../models/user';
import * as middleware from '../middleware';
import * as utils from '../utils';

export const controller = (context: Context.Context) => {
    const { isAuthenticated } = middleware.create(context);
    const updateTodo = async (req: express.Request, res: express.Response) => {
        const body = req.body as User.UpdateTodo;
        const { list, id } = req.params;
        const user = req.user as User.UserClass;
        const error: string[] = [];
        const fields = [
            'title' in body ? utils.validateFields(body, { title: { type: 'string' } }) : '',
            'completed' in body
                ? utils.validateFields(body, { completed: { type: 'boolean' } })
                : '',
            'reminder' in body ? utils.validateFields(body, { reminder: { type: 'number' } }) : '',
            'deadline' in body ? utils.validateFields(body, { deadline: { type: 'number' } }) : '',
            'notes' in body ? utils.validateArray(body.notes as any[], { type: 'string' }) : ''
        ].forEach(err => {
            if (err) {
                error.push(err);
            }
        });
        if (error.length !== 0) {
            return res.status(400).json({ error: error.join(', ') });
        }
        try {
            await user.updateTodo(list, Number(id), {
                title: body.title,
                notes: body.notes,
                completed: body.completed,
                reminder: body.reminder,
                deadline: body.deadline
            });
            const response = { [list]: user.getList(list) };
            return res.status(200).json(response);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    return [isAuthenticated, updateTodo];
};
