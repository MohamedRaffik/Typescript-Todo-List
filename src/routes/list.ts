import { Router } from 'express';
import { Context } from '../context';
import { List } from '../controllers';

export default (context: Context) => {
	const ListRouter = Router();

	ListRouter.get('/', List.getLists(context));
	ListRouter.post('/:list/add', List.addTodo(context));
	ListRouter.put('/:list/update', List.clearList(context));
	ListRouter.delete('/:list/delete', List.deleteList(context));
	ListRouter.delete('/:list/:id', List.deleteTodo(context));

	return ListRouter;
};
