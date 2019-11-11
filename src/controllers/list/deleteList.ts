import { Request, Response } from 'express';
import { Context } from '../../context';
import User from '../../models/user';
import middleware from '../middleware';

export default (context: Context) => {
	const { isAuthenticated } = middleware(context);
	const deleteList = async (req: Request, res: Response) => {
		const list = req.params['list'];
		const user = req.user as User;
		try {
			await user.deleteList(list);
			return res.status(200);
		} catch (err) {
			return res.status(400).json({ error: err.message });
		}
	};
	return [isAuthenticated, deleteList];
};
