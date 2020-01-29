import express from 'express';
import { Context } from '../context';
import { List } from '../controllers';

export const Router = (context: Context) => {
    const ListRouter = express.Router();

    ListRouter.get('/', List.getLists(context));
    ListRouter.get('/:list/:page', List.getList(context));

    ListRouter.post('/:list/add', List.addTodo(context));
    ListRouter.post('/:list', List.createList(context));
    ListRouter.post('/:list/move/:id', List.moveTodo(context));
    ListRouter.post('/:list/rename', List.renameList(context));

    ListRouter.put('/:list/:id', List.updateTodo(context));

    ListRouter.delete('/:list/update', List.clearList(context));
    ListRouter.delete('/:list/delete', List.deleteList(context));
    ListRouter.delete('/:list/:id', List.deleteTodo(context));

    return ListRouter;
};
