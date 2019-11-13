import * as express from 'express';
import * as Context from '../../context';
import * as User from '../../models/user';
import * as middleware from '../middleware';
import * as utils from '../utils';

interface UpdateTodoBody {
	title?: string;
	notes?: string[];
	completed?: boolean;
}

export const controller = (context: Context.Context) => {
	const { isAuthenticated } = middleware.create(context);
	const updateTodo = async (req: express.Request, res: express.Response) => {
		const body = req.body as UpdateTodoBody;
		const { list, id } = req.params;
		const user = req.user as User.UserClass;
		let error = '';
		if ('title' in body) {
			error += utils.validateFields(body, { title: { type: 'string' } });
		}
		if ('completed' in body) {
			error += utils.validateFields(body, { completed: { type: 'boolean' } });
		}
		if ('notes' in body) {
			error += utils.validateArray(body.notes as any[], { type: 'string' });
		}
		if (error) {
			return res.status(400).json({ error });
		}
		try {
			await user.updateTodo(list, Number(id), {
				title: body.title,
				notes: body.notes,
				completed: body.completed
			});
			const response: User.Todo = user.lists[list][id];
			return res.status(200).json(response);
		} catch (err) {
			return res.status(400).json({ error: err.message });
		}
	};
	return [isAuthenticated, updateTodo];
};
