import express from 'express';
import { Context } from '../../context';
import { UpdateTodo, User } from '../../models/user';
import { middleware } from '../middleware';
import { validateArray, validateFields } from '../utils';

export const controller = (context: Context) => {
    const { isAuthenticated } = middleware(context);
    const updateTodo = async (req: express.Request, res: express.Response) => {
        const body = req.body as UpdateTodo;
        const { list, id } = req.params;
        const user = req.user as User;
        const error = [
            'title' in body ? validateFields(body, { title: { type: 'string' } }) : '',
            'completed' in body ? validateFields(body, { completed: { type: 'boolean' } }) : '',
            'reminder' in body ? validateFields(body, { reminder: { type: 'number' } }) : '',
            'deadline' in body ? validateFields(body, { deadline: { type: 'number' } }) : '',
            'notes' in body ? validateArray(body.notes as any[], { type: 'string' }) : ''
        ].filter(err => err);
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
