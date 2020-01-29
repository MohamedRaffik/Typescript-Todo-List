import express from 'express';
import { Context } from '../../context';
import { User } from '../../models/user';
import { middleware } from '../middleware';

export const controller = (context: Context) => {
    const { isAuthenticated } = middleware(context);
    const clearList = async (req: express.Request, res: express.Response) => {
        const { list } = req.params;
        const user = req.user as User;
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
