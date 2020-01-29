import express from 'express';
import { Context } from '../../context';
import { User } from '../../models/user';
import { middleware } from '../middleware';

export const controller = (context: Context) => {
    const { isAuthenticated } = middleware(context);
    const deleteList = async (req: express.Request, res: express.Response) => {
        const { list } = req.params;
        const user = req.user as User;
        try {
            await user.deleteList(list);
            return res.status(200).end();
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    return [isAuthenticated, deleteList];
};
