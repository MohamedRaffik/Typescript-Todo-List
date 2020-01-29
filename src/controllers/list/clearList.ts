import * as express from 'express';
import * as Context from '../../context';
import * as User from '../../models/user';
import * as middleware from '../middleware';

export const controller = (context: Context.Context) => {
    const { isAuthenticated } = middleware.create(context);
    const clearList = async (req: express.Request, res: express.Response) => {
        const { list } = req.params;
        const user = req.user as User.UserClass;
        try {
            await user.clearList(list);
            const response = { [list]: user.getList(list) };
            return res.status(200).json(response);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    return [isAuthenticated, clearList];
};
