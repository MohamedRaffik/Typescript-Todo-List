import * as express from 'express';
import * as Context from '../../context';
import * as User from '../../models/user';
import * as middleware from '../middleware';
import * as utils from '../utils';

interface RenameListBody {
	newListName: string;
}

export const controller = (context: Context.Context) => {
	const { isAuthenticated } = middleware.create(context);
	const renameList = async (req: express.Request, res: express.Response) => {
		const body = req.body as RenameListBody;
		const { list } = req.params;
		const error = utils.validateFields(body, { newListName: { type: 'string' } });
		if (error) {
			return res.status(400).json({ error });
		}
		const user = req.user as User.UserClass;
		try {
			await user.renameList(list, body.newListName);
			return res.status(200);
		} catch (err) {
			return res.status(400).json({ error: err.message });
		}
	};
	return [isAuthenticated, renameList];
};
