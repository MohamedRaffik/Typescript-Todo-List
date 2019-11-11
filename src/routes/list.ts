import { Router } from 'express';
import { Context } from '../context';
import { List } from '../controllers';

export default (context: Context) => {
	const ListRouter = Router();

	ListRouter.post('/:list/add', List.addTodo(context));
	ListRouter.delete('/:list/update', List.clearList(context));

	return ListRouter;
};
