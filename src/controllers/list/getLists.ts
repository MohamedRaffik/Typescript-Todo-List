import { Request, Response } from 'express';
import { Context } from '../../context';
import User, { TodoList } from '../../models/user';
import middleware from '../middleware';

export default (context: Context) => {
	const { isAuthenticated } = middleware(context);
	const getLists = (req: Request, res: Response) => {
		const user = req.user as User;
		const response: TodoList = { ...user.lists };
		return res.status(200).json(response);
	};
	return [isAuthenticated, getLists];
};
