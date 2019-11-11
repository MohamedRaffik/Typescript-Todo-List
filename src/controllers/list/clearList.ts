import { Request, Response } from 'express';
import { Context } from '../../context';
import User from '../../models/user';
import middleware from '../middleware';

export default (context: Context) => {
	const { isAuthenticated } = middleware(context);
	const clearList = async (req: Request, res: Response) => {
		const list = req.params['list'];
		const user = req.user as User;
		try {
			await user.clearList(list);
			return res.status(200).json({ list, items: user.lists[list] });
		} catch (err) {
			return res.status(400).json({ error: err.message });
		}
	};
	return [isAuthenticated, clearList];
};
