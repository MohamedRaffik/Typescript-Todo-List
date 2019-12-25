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
		const error: string[] = [];
		if ('title' in body) {
			const e = utils.validateFields(body, { title: { type: 'string' } });
			if (e) {
				error.push(e);
			}
		}
		if ('completed' in body) {
			const e = utils.validateFields(body, { completed: { type: 'boolean' } });
			if (e) {
				error.push(e);
			}
		}
		if ('notes' in body) {
			const e = utils.validateArray(body.notes as any[], { type: 'string' });
			if (e) {
				error.push(e);
			}
		}
		if (error.length !== 0) {
			return res.status(400).json({ error: error.join(', ') });
		}
		try {
			const response: User.Todo = await user.updateTodo(list, Number(id), {
				title: body.title,
				notes: body.notes,
				completed: body.completed
			});
			return res.status(200).json(response);
		} catch (err) {
			return res.status(400).json({ error: err.message });
		}
	};
	return [isAuthenticated, updateTodo];
};
