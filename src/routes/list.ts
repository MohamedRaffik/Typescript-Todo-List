import * as express from 'express';
import * as Context from '../context';
import * as controllers from '../controllers';

export const Router = (context: Context.Context) => {
	const ListRouter = express.Router();
	const { List } = controllers;

	ListRouter.get('/', List.getLists(context));
	ListRouter.post('/:list/add', List.addTodo(context));
	ListRouter.put('/:list/update', List.clearList(context));
	ListRouter.delete('/:list/delete', List.deleteList(context));
	ListRouter.delete('/:list/:id', List.deleteTodo(context));
	ListRouter.put('/:list/:id', List.updateTodo(context));

	return ListRouter;
};
