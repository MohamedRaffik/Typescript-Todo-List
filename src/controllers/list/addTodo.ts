import * as express from 'express';
import * as Context from '../../context';
import * as User from '../../models/user';
import * as middleware from '../middleware';
import * as utils from '../utils';

interface AddTodoBody {
	title: string;
	notes: string[];
	created: number;
	completed: boolean;
}

export const controller = (context: Context.Context) => {
	const { isAuthenticated } = middleware.create(context);
	const addTodo = async (req: express.Request, res: express.Response) => {
		const body = req.body as AddTodoBody;
		const { list } = req.params;
		let error = utils.validateFields(body, {
			list: { type: 'string', default: 'Master' },
			notes: {},
			completed: { type: 'boolean', default: false }
		});
		if (error) {
			return res.status(400).json({ error });
		}
		error = utils.validateArray(body.notes, { type: 'string' });
		if (error) {
			return res.status(400).json({ error });
		}
		const user = req.user as User.UserClass;
		const newTodo: User.Todo = {
			title: body.title,
			notes: body.notes,
			created: body.created,
			completed: body.completed
		};
		await user.addTodo(list, newTodo);
		const response: User.Todo = user.lists[list][user.lists[list].length - 1];
		return res.status(200).json(response);
	};
	return [isAuthenticated, addTodo];
};
