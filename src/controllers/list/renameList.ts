import express from 'express';
import { Context } from '../../context';
import { User } from '../../models/user';
import { middleware } from '../middleware';
import { validateFields } from '../utils';

interface RenameListBody {
    newListName: string;
}

export const controller = (context: Context) => {
    const { isAuthenticated } = middleware(context);
    const renameList = async (req: express.Request, res: express.Response) => {
        const body = req.body as RenameListBody;
        const { list } = req.params;
        const error = validateFields(body, { newListName: { type: 'string' } });
        if (error) {
            return res.status(400).json({ error });
        }
        const user = req.user as User;
        try {
            await user.renameList(list, body.newListName);
            return res.status(200).end();
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    };
    return [isAuthenticated, renameList];
};
