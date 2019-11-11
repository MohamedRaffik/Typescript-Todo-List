import { Request, Response } from 'express';
import { Context } from '../../context';
import User, { Todo } from '../../models/user';
import middleware from '../middleware';
import { validateArray, validateFields } from '../utils';

interface AddTodoBody {
	list: string;
	title: string;
	notes: string[];
	created: number;
	completed: boolean;
}

interface AddTodoResponse {
	list: string;
	items: Todo[];
}

export default (context: Context) => {
	const { isAuthenticated } = middleware(context);
	const addTodo = async (req: Request, res: Response) => {
		const body = req.body as AddTodoBody;
		const list = req.params['list'];
		let error = validateFields(body, {
			list: { type: 'string', default: 'Master' },
			notes: {},
			created: { type: 'number', default: Date.now() },
			completed: { type: 'boolean', default: false }
		});
		if (error) {
			return res.status(400).json({ error });
		}
		error = validateArray(body.notes, { type: 'string' });
		if (error) {
			return res.status(400).json({ error });
		}
		const user = req.user as User;
		const newTodo: Todo = {
			title: body.title,
			notes: body.notes,
			created: body.created,
			completed: body.completed
		};
		await user.addTodo(body.list, newTodo);
		const response: AddTodoResponse = { list, items: user.lists[list] };
		return res.status(200).json(response);
	};
	return [isAuthenticated, addTodo];
};