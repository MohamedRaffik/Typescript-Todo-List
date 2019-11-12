import { Request, Response } from 'express';
import { Context } from '../../context';
import User, { Todo } from '../../models/user';
import middleware from '../middleware';
import { validateArray, validateFields } from '../utils';

interface UpdateTodoBody {
	title?: string;
	notes?: string[];
	completed?: boolean;
}

export default (context: Context) => {
	const { isAuthenticated } = middleware(context);
	const updateTodo = async (req: Request, res: Response) => {
		const body = req.body as UpdateTodoBody;
		const { list, id } = req.params;
		const user = req.user as User;
		let error = '';
		if ('title' in body) {
			error += validateFields(body, { title: { type: 'string' } });
		}
		if ('completed' in body) {
			error += validateFields(body, { completed: { type: 'boolean' } });
		}
		if ('notes' in body) {
			error += validateArray(body.notes as any[], { type: 'string' });
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
			const response: Todo = user.lists[list][id];
			return res.status(200).json(response);
		} catch (err) {
			return res.status(400).json({ error: err.message });
		}
	};
	return [isAuthenticated, updateTodo];
};
