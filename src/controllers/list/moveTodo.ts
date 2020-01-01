import * as express from 'express';
import * as Context from '../../context';
import * as User from '../../models/user';
import * as middleware from '../middleware';
import * as utils from '../utils';

interface MoveTodoBody {
    newList: string;
    newId: number;
}

export const controller = (context: Context.Context) => {
    const { isAuthenticated } = middleware.create(context);
    const moveTodo = async (req: express.Request, res: express.Response) => {
        const { list, id } = req.params;
        const body = req.body as MoveTodoBody;
        const error = utils.validateFields(body, {
            newList: { type: 'string' },
            newId: { type: 'number' }
        });
        if (error) {
            return res.status(400).json({ error });
        }
        const user = req.user as User.UserClass;
        try {
            const response = await user.moveTodo(list, Number(id), body.newList, body.newId);
            return res.status(200).json(response);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    return [isAuthenticated, moveTodo];
};
