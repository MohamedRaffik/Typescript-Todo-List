import * as User from '../../../models/user';
import * as mock from '../../mock';

describe('Unit Testing User Class', () => {
	let user: User.UserClass;
	const context = mock.createMockContext();
	const todo: User.Todo = {
		title: 'Create TODO',
		notes: ['Note 1', 'Note 2'],
		created: Date.now()
	};

	beforeEach(async () => {
		await context.db.dropCollection('Users');
		user = await context.User.create(context.db, {
			email: 'someemail@gmail.com',
			username: 'John Doe',
			password: 'password123'
		});
	});

	describe('testing createList', () => {
		it('should throw an error if the list to be created already exists', async () => {
			await expect(user.createList('Master')).rejects.toThrow("'Master' list already exists");
		});

		it('should create a list if it does not exist', async () => {
			expect(user.lists).toEqual({ Master: [] });
			await user.createList('Cool');
			expect(user.lists).toEqual({ Master: [], Cool: [] });
		});
	});

	describe('testing addTodo', () => {
		it('should add a todo item to the list and create that list if it does not exist', async () => {
			expect(user.lists).toEqual({ Master: [] });
			await user.addTodo('School', todo);
			expect(user.lists).toEqual({
				Master: [],
				School: [{ ...todo, id: 0, completed: false }]
			});
		});
	});

	describe('testing updateTodo', () => {
		it('should not update if the values of the update object are undefined', async () => {
			await user.addTodo('School', todo);
			await user.updateTodo('School', 0, { completed: undefined, notes: undefined });
			expect(user.lists['School'][0]).toEqual({
				...todo,
				id: 0,
				completed: false
			});
		});

		it('should throw an error if the list does not exist', async () => {
			await expect(
				user.updateTodo('Food', 0, { completed: true, title: 'Updated Item' })
			).rejects.toThrow("'Food' list does not exist");
		});

		it('should mark a todo item as completed in the list', async () => {
			await user.addTodo('School', todo);
			expect(user.lists['School'][0].completed).toEqual(false);
			await user.updateTodo('School', 0, { completed: true });
			expect(user.lists['School'][0]).toEqual({
				...todo,
				id: 0,
				completed: true
			});
		});
	});

	describe('testing deleteTodo', () => {
		it('should throw an error if the todo item does not exist', async () => {
			await expect(user.deleteTodo('Master', 100)).rejects.toThrow(
				"Item does not exist in 'Master' list"
			);
		});

		it('should remove a todo item from the list', async () => {
			await user.addTodo('School', todo);
			expect(user.lists['School'].length).toEqual(1);
			await user.deleteTodo('School', 0);
			expect(user.lists['School']).toEqual([]);
		});
	});

	describe('testing deleteList', () => {
		it('should throw an error when trying to delete the master list', async () => {
			expect(user.lists).toHaveProperty('Master');
			await expect(user.deleteList('Master')).rejects.toThrow("Cannot delete 'Master' list");
		});

		it('should delete a list from the user lists if it is not the master list', async () => {
			await user.createList('School');
			expect(user.lists).toHaveProperty('School');
			await user.deleteList('School');
			expect(user.lists).not.toHaveProperty('School');
		});
	});

	describe('testing clearList', () => {
		it('should throw an error if the list to be cleared does not exist', async () => {
			await expect(user.clearList('School')).rejects.toThrow("'School' list does not exist");
		});

		it('should clear the list of all todo items', async () => {
			await user.addTodo('Master', todo);
			expect(user.lists['Master'].length).toEqual(1);
			await user.clearList('Master');
			expect(user.lists['Master'].length).toEqual(0);
		});
	});

	describe('testing renameList', () => {
		it('should throw an error if the list to be renamed does not exist', async () => {
			await expect(user.renameList('TestList', 'RenamedList')).rejects.toThrow(
				"'TestList' list does not exist"
			);
		});

		it('should throw an error if the newList already exists', async () => {
			await user.addTodo('TestList', todo);
			expect(user.lists['TestList'].length).toEqual(1);
			await expect(user.renameList('TestList', 'Master')).rejects.toThrow(
				"Cannot rename 'TestList' list to 'Master', 'Master' list already exists"
			);
		});

		it('should throw an error if the list to be renamed is the Master list', async () => {
			await expect(user.renameList('Master', 'NewMaster')).rejects.toThrow(
				"Cannot rename 'Master' list"
			);
		});

		it('should rename the list to the new given list', async () => {
			await user.addTodo('TestList', todo);
			const oldList = user.lists['TestList'];
			await user.renameList('TestList', 'RenamedList');
			expect(user.lists).toHaveProperty('RenamedList');
			expect(user.lists).not.toHaveProperty('TestList');
			expect(user.lists['RenamedList']).toEqual(oldList);
		});
	});

	describe('testing moveTodo', () => {
		it('should throw an error if the list to move an item from does not exist', async () => {
			await expect(user.moveTodo('TestList', 0, 'Master', 0)).rejects.toThrow(
				"'TestList' list does not exist"
			);
		});

		it('should throw an error if the item to be moved does not exist in the list', async () => {
			await user.createList('TestList');
			await expect(user.moveTodo('TestList', 0, 'Master', 0)).rejects.toThrow(
				"Item does not exist in 'TestList' list"
			);
		});

		it('should throw an error if the newId is a negative number', async () => {
			await user.createList('TestList');
			await expect(user.moveTodo('TestList', 0, 'Master', -1)).rejects.toThrow(
				"Item does not exist in 'TestList' list"
			);
		});

		it('should move an item from one list to another', async () => {
			await user.addTodo('TestList', todo);
			await user.addTodo('TestList', { ...todo, title: todo.title + '1' });
			await user.addTodo('TestList', { ...todo, title: todo.title + '2' });
			await user.addTodo('Master', { ...todo, title: todo.title + 'master1' });
			await user.addTodo('Master', { ...todo, title: todo.title + 'master2' });
			await user.moveTodo('TestList', 1, 'Master', 1);
			expect(user.lists['TestList']).toEqual([
				{
					...todo,
					completed: false,
					id: 0
				},
				{
					...todo,
					title: todo.title + '2',
					completed: false,
					id: 1
				}
			]);
			expect(user.lists['Master']).toEqual([
				{
					...todo,
					title: todo.title + 'master1',
					completed: false,
					id: 0
				},
				{
					...todo,
					title: todo.title + '1',
					completed: false,
					id: 1
				},
				{
					...todo,
					title: todo.title + 'master2',
					completed: false,
					id: 2
				}
			]);
		});

		it('should be able to move an item within the same list', async () => {
			await user.addTodo('TestList', todo);
			await user.addTodo('TestList', { ...todo, title: todo.title + '1' });
			await user.addTodo('TestList', { ...todo, title: todo.title + '2' });
			await user.addTodo('TestList', { ...todo, title: todo.title + '3' });
			await user.addTodo('TestList', { ...todo, title: todo.title + '4' });
			await user.moveTodo('TestList', 3, 'TestList', 1);
			expect(user.lists['TestList']).toEqual([
				{
					...todo,
					completed: false,
					id: 0
				},
				{
					...todo,
					title: todo.title + '3',
					completed: false,
					id: 1
				},
				{
					...todo,
					title: todo.title + '1',
					completed: false,
					id: 2
				},
				{
					...todo,
					title: todo.title + '2',
					completed: false,
					id: 3
				},
				{
					...todo,
					title: todo.title + '4',
					completed: false,
					id: 4
				}
			]);
		});
	});
});
