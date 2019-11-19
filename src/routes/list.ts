import * as express from 'express';
import * as Context from '../context';
import * as controllers from '../controllers';

export const Router = (context: Context.Context) => {
	const ListRouter = express.Router();
	const { List } = controllers;

	ListRouter.get('/', List.getLists(context));

	ListRouter.post('/:list/add', List.addTodo(context));
	ListRouter.post('/:list', List.createList(context));
	ListRouter.post('/:list/move/:id', List.moveTodo(context));

	ListRouter.put('/:list/rename', List.renameList(context));
	ListRouter.put('/:list/:id', List.updateTodo(context));

	ListRouter.delete('/:list/update', List.clearList(context));
	ListRouter.delete('/:list/delete', List.deleteList(context));
	ListRouter.delete('/:list/:id', List.deleteTodo(context));

	return ListRouter;
};
