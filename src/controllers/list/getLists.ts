import * as express from 'express';
import * as Context from '../../context';
import * as User from '../../models/user';
import * as middleware from '../middleware';

export const controller = (context: Context.Context) => {
	const { isAuthenticated } = middleware.create(context);
	const getLists = (req: express.Request, res: express.Response) => {
		const user = req.user as User.UserClass;
		const response: User.TodoList = { ...user.lists };
		return res.status(200).json(response);
	};
	return [isAuthenticated, getLists];
};
