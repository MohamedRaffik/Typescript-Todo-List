import * as addTodo from './addTodo';
import * as clearList from './clearList';
import * as deleteList from './deleteList';
import * as deleteTodo from './deleteTodo';
import * as getLists from './getLists';
import * as updateTodo from './updateTodo';

export const ListControllers = {
	addTodo: addTodo.controller,
	clearList: clearList.controller,
	deleteList: deleteList.controller,
	deleteTodo: deleteTodo.controller,
	getLists: getLists.controller,
	updateTodo: updateTodo.controller
};
