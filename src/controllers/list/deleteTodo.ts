import * as express from 'express';
import * as Context from '../../context';
import * as User from '../../models/user';
import * as middleware from '../middleware';

export const controller = (context: Context.Context) => {
    const { isAuthenticated } = middleware.create(context);
    const deleteTodo = async (req: express.Request, res: express.Response) => {
        const { list, id } = req.params;
        const user = req.user as User.UserClass;
        try {
            await user.deleteTodo(list, Number(id));
            return res.status(200).end();
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    return [isAuthenticated, deleteTodo];
};
