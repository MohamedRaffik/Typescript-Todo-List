import { Router } from 'express';
import { Context } from '../context';
import { List } from '../controllers';

export default (context: Context) => {
	const ListRouter = Router();

	ListRouter.post('/add', List.addTodo(context));

	return ListRouter;
};
