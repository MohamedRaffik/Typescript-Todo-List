import express from 'express';
import { Context } from '../../context';
import { User } from '../../models/user';
import { middleware } from '../middleware';

export const controller = (context: Context) => {
    const { isAuthenticated } = middleware(context);
    const getLists = (req: express.Request, res: express.Response) => {
        const user = req.user as User;
        const response = user.getLists();
        return res.status(200).json(response);
    };
    return [isAuthenticated, getLists];
};
