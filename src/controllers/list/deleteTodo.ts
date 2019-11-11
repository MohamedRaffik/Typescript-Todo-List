import { Request, Response } from 'express';
import { Context } from '../../context';
import User from '../../models/user';
import middleware from '../middleware';

export default (context: Context) => {
	const { isAuthenticated } = middleware(context);
	const deleteTodo = async (req: Request, res: Response) => {
		const { list, id } = req.params;
		const user = req.user as User;
		try {
			await user.deleteTodo(list, Number(id));
			return res.status(200);
		} catch (err) {
			return res.status(400).json({ error: err.message });
		}
	};
	return [isAuthenticated, deleteTodo];
};
