import * as express from 'express';
import * as Context from '../../context';
import * as User from '../../models/user';
import * as middleware from '../middleware';
import * as utils from '../utils';

export const controller = (context: Context.Context) => {
	const { isAuthenticated } = middleware.create(context);
	const getList = (req: express.Request, res: express.Response) => {
		const { list, page } = req.params;
		const user = req.user as User.UserClass;
		if (isNaN(Number(page))) {
			return res.status(400).json({ error: 'Page is not a number' });
		}
		try {
			const response = { [list]: user.getList(list, Number(page)) };
			return res.status(200).json(response);
		} catch (err) {
			return res.status(400).json({ error: err.message });
		}
	};
	return [isAuthenticated, getList];
};
