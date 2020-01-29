import express from 'express';
import { Context } from '../../context';
import { User } from '../../models/user';
import { middleware } from '../middleware';
import { validateFields } from '../utils';

interface MoveTodoBody {
    newList: string;
}

export const controller = (context: Context) => {
    const { isAuthenticated } = middleware(context);
    const moveTodo = async (req: express.Request, res: express.Response) => {
        const { list, id } = req.params;
        const body = req.body as MoveTodoBody;
        const error = validateFields(body, {
            newList: { type: 'string' }
        });
        if (error) {
            return res.status(400).json({ error });
        }
        const user = req.user as User;
        try {
            await user.moveTodo(list, Number(id), body.newList);
            const response = { [body.newList]: user.getList(body.newList) };
            return res.status(200).json(response);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    return [isAuthenticated, moveTodo];
};
