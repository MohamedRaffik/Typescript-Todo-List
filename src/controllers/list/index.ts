import * as addTodo from './addTodo';
import * as clearList from './clearList';
import * as createList from './createList';
import * as deleteList from './deleteList';
import * as deleteTodo from './deleteTodo';
import * as getList from './getList';
import * as getLists from './getLists';
import * as moveTodo from './moveTodo';
import * as renameList from './renameList';
import * as updateTodo from './updateTodo';

export const ListControllers = {
    addTodo: addTodo.controller,
    clearList: clearList.controller,
    deleteList: deleteList.controller,
    deleteTodo: deleteTodo.controller,
    getLists: getLists.controller,
    getList: getList.controller,
    updateTodo: updateTodo.controller,
    createList: createList.controller,
    renameList: renameList.controller,
    moveTodo: moveTodo.controller
};
