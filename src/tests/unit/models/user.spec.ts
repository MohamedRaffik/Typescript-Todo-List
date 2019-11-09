import { expect } from 'chai';
import { default as UserClass, Todo } from '../../../models/user';
import createMockContext from '../mock';

describe('Unit Testing User Class', () => {
	let user: UserClass;
	const todo: Todo = {
		title: 'Create TODO',
		notes: ['Note 1', 'Note 2'],
		created: Date.now()
	};

	before(async () => {
		const { db, User } = createMockContext();
		user = await User.create(db, {
			email: 'someemail@gmail.com',
			username: 'John Doe',
			password: 'password123'
		});
	});

	describe('testing addTodo', async () => {
		it('should add a todo item to the master todo list if there is no list defined', async () => {
			expect(user.lists['Master'].length).to.equal(0);
			await user.addTodo(todo);
			expect(user.lists['Master'][0]).to.deep.equal({
				...todo,
				list: 'Master',
				completed: false
			});
		});

		it('should add a todo item to the list and create that list if it does not exist', async () => {
			expect(user.lists).to.not.have.property('School');
			await user.addTodo({ ...todo, list: 'School' });
			expect(user.lists['School'][0]).to.deep.equal({
				...todo,
				list: 'School',
				completed: false
			});
		});
	});

	describe('testing completeTodo', async () => {
		it('should mark a todo item as completed in the list', async () => {
			await user.completeTodo(0, 'School');
			expect(user.lists['School'][0]).to.deep.equal({
				...todo,
				list: 'School',
				completed: true
			});
		});

		it('should throw an error if the list does not exist', async () => {
			try {
				await user.completeTodo(0, 'Food');
				throw Error('Item added to non existent list');
			} catch (err) {
				expect(err.message).to.equal("'Food' list does not exist");
			}
		});
	});

	describe('testing inCompleteTodo', () => {
		it('should mark a todo item as incomplete in the list', async () => {
			await user.inCompleteTodo(0, 'School');
			expect(user.lists['School'][0]).to.deep.equal({
				...todo,
				list: 'School',
				completed: false
			});
		});

		it('should throw an error if the todo item does not exist', async () => {
			try {
				await user.inCompleteTodo(100, 'School');
				throw Error('Non existent Todo item marked as incomplete');
			} catch (err) {
				expect(err.message).to.equal("Item does not exist in 'School' list");
			}
		});
	});

	describe('testing deleteTodo', () => {
		it('should remove a todo item from the list', async () => {
			expect(user.lists['School'].length).to.equal(1);
			await user.deleteTodo(0, 'School');
			expect(user.lists['School']).to.deep.equal([]);
		});

		it('should throw an error if the todo item does not exist', async () => {
			try {
				await user.deleteTodo(100);
				throw Error('Non existent Todo item was deleted');
			} catch (err) {
				expect(err.message).to.equal("Item does not exist in 'Master' list");
			}
		});
	});

	describe('testing deleteList', () => {
		it('should delete a list from the user lists if it is not the master list', async () => {
			expect(user.lists).to.have.property('School');
			await user.deleteList('School');
			expect(user.lists).to.not.have.property('School');
		});

		it('should throw an error when trying to delete the master list', async () => {
			try {
				expect(user.lists).to.have.property('Master');
				await user.deleteList('Master');
				throw Error('Master list was deleted');
			} catch (err) {
				expect(err.message).to.equal("Cannot delete 'Master' list");
			}
		});
	});

	describe('testing clearList', () => {
		it('should clear the list of all todo items', async () => {
			expect(user.lists['Master'].length).to.equal(1);
			await user.clearList();
			expect(user.lists['Master'].length).to.equal(0);
		});

		it('should throw an error if the list to be cleared does not exist', async () => {
			try {
				await user.clearList('School');
				throw Error('List that does not exist was cleared');
			} catch (err) {
				expect(err.message).to.equal("'School' list does not exist");
			}
		});
	});
});
