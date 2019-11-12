import { expect } from 'chai';
import { default as UserClass, Todo } from '../../../models/user';
import createMockContext from '../mock';

describe('Unit Testing User Class', () => {
	let user: UserClass;
	const { db, User } = createMockContext();
	const todo: Todo = {
		title: 'Create TODO',
		notes: ['Note 1', 'Note 2'],
		created: Date.now()
	};

	beforeEach(async () => {
		await db.dropCollection('Users');
		user = await User.create(db, {
			email: 'someemail@gmail.com',
			username: 'John Doe',
			password: 'password123'
		});
	});

	describe('testing createList', () => {
		it('should throw an error if the list to be created already exists', async () => {
			try {
				await user.createList('Master');
				throw Error('Duplicate list was created');
			} catch (err) {
				expect(err.message).to.equal("'Master' list already exists");
			}
		});

		it('should create a list if it does not exist', async () => {
			expect(user.lists).to.not.have.property('Cool');
			await user.createList('Cool');
			expect(user.lists).to.have.property('Cool');
		});
	});

	describe('testing addTodo', () => {
		it('should add a todo item to the list and create that list if it does not exist', async () => {
			expect(user.lists).to.not.have.property('School');
			await user.addTodo('School', todo);
			expect(user.lists['School'][0]).to.deep.equal({
				...todo,
				id: 0,
				completed: false
			});
		});
	});

	describe('testing updateTodo', () => {
		it('should not update if the values of the update object are undefined', async () => {
			await user.addTodo('School', todo);
			await user.updateTodo('School', 0, { completed: undefined, notes: undefined });
			expect(user.lists['School'][0]).to.deep.equal({
				...todo,
				id: 0,
				completed: false
			});
		});

		it('should throw an error if the list does not exist', async () => {
			try {
				await user.updateTodo('Food', 0, { completed: true, title: 'Updated Item' });
				throw Error('Item added to non existent list');
			} catch (err) {
				expect(err.message).to.equal("'Food' list does not exist");
			}
		});

		it('should mark a todo item as completed in the list', async () => {
			await user.addTodo('School', todo);
			await user.updateTodo('School', 0, { completed: true });
			expect(user.lists['School'][0]).to.deep.equal({
				...todo,
				id: 0,
				completed: true
			});
		});
	});

	describe('testing deleteTodo', () => {
		it('should throw an error if the todo item does not exist', async () => {
			try {
				await user.deleteTodo('Master', 100);
				throw Error('Non existent Todo item was deleted');
			} catch (err) {
				expect(err.message).to.equal("Item does not exist in 'Master' list");
			}
		});

		it('should remove a todo item from the list', async () => {
			await user.addTodo('School', todo);
			expect(user.lists['School'].length).to.equal(1);
			await user.deleteTodo('School', 0);
			expect(user.lists['School']).to.deep.equal([]);
		});
	});

	describe('testing deleteList', () => {
		it('should throw an error when trying to delete the master list', async () => {
			try {
				expect(user.lists).to.have.property('Master');
				await user.deleteList('Master');
				throw Error('Master list was deleted');
			} catch (err) {
				expect(err.message).to.equal("Cannot delete 'Master' list");
			}
		});

		it('should delete a list from the user lists if it is not the master list', async () => {
			await user.createList('School');
			expect(user.lists).to.have.property('School');
			await user.deleteList('School');
			expect(user.lists).to.not.have.property('School');
		});
	});

	describe('testing clearList', () => {
		it('should throw an error if the list to be cleared does not exist', async () => {
			try {
				await user.clearList('School');
				throw Error('List that does not exist was cleared');
			} catch (err) {
				expect(err.message).to.equal("'School' list does not exist");
			}
		});

		it('should clear the list of all todo items', async () => {
			await user.addTodo('Master', todo);
			expect(user.lists['Master'].length).to.equal(1);
			await user.clearList('Master');
			expect(user.lists['Master'].length).to.equal(0);
		});
	});

	describe('testing renameList', () => {
		it('should throw an error if the list to be renamed does not exist', async () => {
			try {
				await user.renameList('TestList', 'RenamedList');
				throw Error('Non existent list was renamed');
			} catch (err) {
				expect(err.message).to.equal("'TestList' list does not exist");
			}
		});

		it('should throw an error if the newList already exists', async () => {
			await user.addTodo('TestList', todo);
			expect(user.lists['TestList'].length).to.equal(1);
			try {
				await user.renameList('TestList', 'Master');
				throw Error('Existing list is overwritten');
			} catch (err) {
				expect(err.message).to.equal(
					"Cannot rename 'TestList' list to 'Master' list, 'Master' list already exists"
				);
			}
		});

		it('should throw an error if the list to be renamed is the Master list', async () => {
			try {
				await user.renameList('Master', 'NewMaster');
				throw Error('Master list was renamed');
			} catch (err) {
				expect(err.message).to.equal("Cannot rename 'Master' list");
			}
		});

		it('should rename the list to the new given list', async () => {
			await user.addTodo('TestList', todo);
			const oldList = user.lists['TestList'];
			await user.renameList('TestList', 'RenamedList');
			expect(user.lists).to.have.property('RenamedList');
			expect(user.lists).to.not.have.property('TestList');
			expect(user.lists['RenamedList']).to.deep.equal(oldList);
		});
	});

	describe('testing moveTodo', () => {
		it('should throw an error if the list to move an item from does not exist', async () => {
			try {
				await user.moveTodo('TestList', 0, 'Master', 0);
				throw Error('Non existent list had an item moved from it');
			} catch (err) {
				expect(err.message).to.equal("'TestList' list does not exist");
			}
		});

		it('should throw an error if the item to be moved does not exist in the list', async () => {
			try {
				await user.createList('TestList');
				await user.moveTodo('TestList', 0, 'Master', 0);
				throw Error('Non existent item was moved');
			} catch (err) {
				expect(err.message).to.equal("Item does not exist in 'TestList' list");
			}
		});

		it('should throw an error if the newId is a negative number', async () => {
			try {
				await user.createList('TestList');
				await user.moveTodo('TestList', 0, 'Master', -1);
				throw Error('Non existent item was moved');
			} catch (err) {
				expect(err.message).to.equal("Item does not exist in 'TestList' list");
			}
		});

		it('should move an item from one list to another', async () => {
			await user.addTodo('TestList', todo);
			await user.addTodo('TestList', { ...todo, title: todo.title + '1' });
			await user.addTodo('TestList', { ...todo, title: todo.title + '2' });
			await user.addTodo('Master', { ...todo, title: todo.title + 'master1' });
			await user.addTodo('Master', { ...todo, title: todo.title + 'master2' });
			expect(user.lists['Master'].length).to.equal(2);
			expect(user.lists['TestList'].length).to.equal(3);
			await user.moveTodo('TestList', 1, 'Master', 1);
			expect(user.lists['TestList'].length).to.equal(2);
			expect(user.lists['TestList'][0].title).to.equal(todo.title);
			expect(user.lists['TestList'][0].id).to.equal(0);
			expect(user.lists['TestList'][1].title).to.equal(todo.title + '2');
			expect(user.lists['TestList'][1].id).to.equal(1);
			expect(user.lists['Master'].length).to.equal(3);
			expect(user.lists['Master'][0].title).to.equal(todo.title + 'master1');
			expect(user.lists['Master'][0].id).to.equal(0);
			expect(user.lists['Master'][1].title).to.equal(todo.title + '1');
			expect(user.lists['Master'][1].id).to.equal(1);
			expect(user.lists['Master'][2].title).to.equal(todo.title + 'master2');
			expect(user.lists['Master'][2].id).to.equal(2);
		});

		it('should be able to move an item within the same list', async () => {
			await user.addTodo('TestList', todo);
			await user.addTodo('TestList', { ...todo, title: todo.title + '1' });
			await user.addTodo('TestList', { ...todo, title: todo.title + '2' });
			await user.addTodo('TestList', { ...todo, title: todo.title + '3' });
			await user.addTodo('TestList', { ...todo, title: todo.title + '4' });
			await user.moveTodo('TestList', 3, 'TestList', 1);
			expect(user.lists['TestList'].length).to.equal(5);
			expect(user.lists['TestList'][0].title).to.equal(todo.title);
			expect(user.lists['TestList'][0].id).to.equal(0);
			expect(user.lists['TestList'][1].title).to.equal(todo.title + '3');
			expect(user.lists['TestList'][1].id).to.equal(1);
			expect(user.lists['TestList'][2].title).to.equal(todo.title + '1');
			expect(user.lists['TestList'][2].id).to.equal(2);
			expect(user.lists['TestList'][3].title).to.equal(todo.title + '2');
			expect(user.lists['TestList'][3].id).to.equal(3);
			expect(user.lists['TestList'][4].title).to.equal(todo.title + '4');
			expect(user.lists['TestList'][4].id).to.equal(4);
		});
	});
});
