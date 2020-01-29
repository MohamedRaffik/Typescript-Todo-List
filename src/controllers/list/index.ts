import { controller as AddTodoController } from './addTodo';
import { controller as ClearListController } from './clearList';
import { controller as CreateListController } from './createList';
import { controller as DeleteListController } from './deleteList';
import { controller as DeleteTodoController } from './deleteTodo';
import { controller as GetListController } from './getList';
import { controller as GetListsController } from './getLists';
import { controller as MoveTodoController } from './moveTodo';
import { controller as RenameListController } from './renameList';
import { controller as UpdateTodoController } from './updateTodo';

export const ListControllers = {
    addTodo: AddTodoController,
    clearList: ClearListController,
    deleteList: DeleteListController,
    deleteTodo: DeleteTodoController,
    getLists: GetListsController,
    getList: GetListController,
    updateTodo: UpdateTodoController,
    createList: CreateListController,
    renameList: RenameListController,
    moveTodo: MoveTodoController
};
