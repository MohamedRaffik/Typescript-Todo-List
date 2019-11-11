import { Request, Response } from 'express';
import { Context } from '../../context';
import User, { Todo } from '../../models/user';
import middleware from '../middleware';

interface ClearListResponse {
	list: string;
	items: Todo[];
}

export default (context: Context) => {
	const { isAuthenticated } = middleware(context);
	const clearList = async (req: Request, res: Response) => {
		const { list } = req.params;
		const user = req.user as User;
		try {
			await user.clearList(list);
			const response: ClearListResponse = { list, items: user.lists[list] };
			return res.status(200).json(response);
		} catch (err) {
			return res.status(400).json({ error: err.message });
		}
	};
	return [isAuthenticated, clearList];
};
