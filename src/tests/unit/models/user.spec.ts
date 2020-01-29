import { User, Todo } from '../../../models/user';
import { createMockContext } from '../../mock';

describe('Unit Testing User Class', () => {
    let user: User;
    const context = createMockContext();
    const todo: Todo = {
        title: 'Create TODO',
        notes: ['Note 1', 'Note 2'],
        created: Date.now(),
        deadline: Date.now() + 10000
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
            await expect(user.createList('Main')).rejects.toThrowError(
                "'Main' list already exists"
            );
        });

        it('should throw and error if the list limit of 50 is reached', async () => {
            for (let i = 0; i < 49; i++) {
                await user.createList(`List${i}`);
            }
            await expect(user.createList('List that cannot be created')).rejects.toThrowError(
                'Maximum number of lists reached'
            );
        });

        it('should create a list if it does not exist', async () => {
            expect(user.lists).toEqual({ Main: [] });
            await user.createList('Cool');
            expect(user.lists).toEqual({ Main: [], Cool: [] });
        });
    });

    describe('testing addTodo', () => {
        it('should throw an error when adding a todo item to a List with 100 elements', async () => {
            expect(user.lists).toEqual({ Main: [] });
            for (let i = 0; i < 100; i++) {
                await user.addTodo('Main', todo);
            }
            await expect(user.addTodo('Main', todo)).rejects.toThrowError(
                "'Main' list has reached its Todo Item limit"
            );
        });

        it('should add a todo item to the list and create that list if it does not exist', async () => {
            expect(user.lists).toEqual({ Main: [] });
            await user.addTodo('School', todo);
            expect(user.lists).toEqual({
                Main: [],
                School: [{ ...todo, completed: false }]
            });
        });

        it('should add a todo item to the list and maintain sort order', async () => {
            todo.deadline = Number(todo.deadline);
            expect(user.lists).toEqual({ Main: [] });
            await user.addTodo('Main', todo);
            await user.addTodo('Main', {
                ...todo,
                deadline: todo.deadline - 1000,
                title: todo.title + '1'
            });
            const todoWithNoDeadline = { ...todo, title: todo.title + '2' };
            delete todoWithNoDeadline.deadline;
            await user.addTodo('Main', todoWithNoDeadline);
            expect(user.lists['Main']).toEqual([
                { ...todo, deadline: todo.deadline - 1000, title: todo.title + '1' },
                { ...todo },
                { ...todoWithNoDeadline, title: todo.title + '2' }
            ]);
        });
    });

    describe('testing updateTodo', () => {
        it('should not update if the values of the update object are undefined', async () => {
            await user.addTodo('School', todo);
            await user.updateTodo('School', 0, { completed: undefined, notes: undefined });
            expect(user.lists['School'][0]).toEqual({
                ...todo,
                completed: false
            });
        });

        it('should throw an error if the list does not exist', async () => {
            await expect(
                user.updateTodo('Food', 0, { completed: true, title: 'Updated Item' })
            ).rejects.toThrowError("'Food' list does not exist");
        });

        it('should mark a todo item as completed in the list', async () => {
            await user.addTodo('School', todo);
            expect(user.lists['School'][0].completed).toEqual(false);
            await user.updateTodo('School', 0, { completed: true });
            expect(user.lists['School'][0]).toEqual({
                ...todo,
                completed: true
            });
        });

        it('should maintain sort order when updating deadline time', async () => {
            todo.deadline = Number(todo.deadline);
            await user.addTodo('Main', todo);
            await user.addTodo('Main', {
                ...todo,
                deadline: todo.deadline + 1000,
                title: todo.title + '1'
            });
            expect(user.lists['Main']).toEqual([
                { ...todo },
                { ...todo, deadline: todo.deadline + 1000, title: todo.title + '1' }
            ]);
            await user.updateTodo('Main', 1, { deadline: todo.deadline - 2000 });
            expect(user.lists['Main']).toEqual([
                { ...todo, deadline: todo.deadline - 2000, title: todo.title + '1' },
                { ...todo }
            ]);
        });
    });

    describe('testing deleteTodo', () => {
        it('should throw an error if the todo item does not exist', async () => {
            await expect(user.deleteTodo('Main', 100)).rejects.toThrowError(
                "Item does not exist in 'Main' list"
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
        it('should throw an error when trying to delete the Main list', async () => {
            expect(user.lists).toHaveProperty('Main');
            await expect(user.deleteList('Main')).rejects.toThrowError("Cannot delete 'Main' list");
        });

        it('should delete a list from the user lists if it is not the Main list', async () => {
            await user.createList('School');
            expect(user.lists).toHaveProperty('School');
            await user.deleteList('School');
            expect(user.lists).not.toHaveProperty('School');
        });
    });

    describe('testing clearList', () => {
        it('should throw an error if the list to be cleared does not exist', async () => {
            await expect(user.clearList('School')).rejects.toThrowError(
                "'School' list does not exist"
            );
        });

        it('should clear the list of all todo items', async () => {
            await user.addTodo('Main', todo);
            expect(user.lists['Main'].length).toEqual(1);
            await user.clearList('Main');
            expect(user.lists['Main'].length).toEqual(0);
        });
    });

    describe('testing renameList', () => {
        it('should throw an error if the list to be renamed does not exist', async () => {
            await expect(user.renameList('TestList', 'RenamedList')).rejects.toThrowError(
                "'TestList' list does not exist"
            );
        });

        it('should throw an error if the newList already exists', async () => {
            await user.addTodo('TestList', todo);
            expect(user.lists['TestList'].length).toEqual(1);
            await expect(user.renameList('TestList', 'Main')).rejects.toThrowError(
                "Cannot rename 'TestList' list to 'Main', 'Main' list already exists"
            );
        });

        it('should throw an error if the list to be renamed is the Main list', async () => {
            await expect(user.renameList('Main', 'NewMain')).rejects.toThrowError(
                "Cannot rename 'Main' list"
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
            await expect(user.moveTodo('TestList', 0, 'Main')).rejects.toThrowError(
                "'TestList' list does not exist"
            );
        });

        it('should throw an error if the item to be moved does not exist in the list', async () => {
            await user.createList('TestList');
            await expect(user.moveTodo('TestList', 0, 'Main')).rejects.toThrowError(
                "Item does not exist in 'TestList' list"
            );
        });

        it('should throw an error if the newId is a negative number', async () => {
            await user.createList('TestList');
            await expect(user.moveTodo('TestList', 0, 'Main')).rejects.toThrowError(
                "Item does not exist in 'TestList' list"
            );
        });

        it('should throw an error when moving an item within the same list', async () => {
            await user.addTodo('TestList', todo);
            await expect(user.moveTodo('TestList', 0, 'TestList')).rejects.toThrow(
                'Cannot move within the same list'
            );
        });

        it('should move an item from one list to another and maintain sort order', async () => {
            todo.deadline = Number(todo.deadline);
            await user.addTodo('TestList', todo);
            await user.addTodo('TestList', {
                ...todo,
                title: todo.title + '1',
                deadline: todo.deadline + 1001
            });
            await user.addTodo('TestList', {
                ...todo,
                title: todo.title + '2',
                deadline: todo.deadline + 1002
            });
            await user.addTodo('Main', {
                ...todo,
                title: todo.title + 'Main1',
                deadline: todo.deadline + 1003
            });
            const noDeadline = { ...todo };
            delete noDeadline.deadline;
            await user.addTodo('Main', {
                ...noDeadline,
                title: todo.title + 'Main2'
            });
            await user.moveTodo('TestList', 1, 'Main');
            expect(user.lists['TestList']).toEqual([
                { ...todo },
                {
                    ...todo,
                    title: todo.title + '2',
                    deadline: todo.deadline + 1002
                }
            ]);
            expect(user.lists['Main']).toEqual([
                {
                    ...todo,
                    title: todo.title + '1',
                    deadline: todo.deadline + 1001
                },
                {
                    ...todo,
                    title: todo.title + 'Main1',
                    deadline: todo.deadline + 1003
                },
                {
                    ...noDeadline,
                    title: todo.title + 'Main2'
                }
            ]);
        });
    });

    describe('testing getLists', () => {
        it("should return the first page of every list of the users' Todo Lists", () => {
            expect(user.getLists()).toEqual({
                Main: []
            });
        });
    });

    describe('testing getList', () => {
        it('should throw an error if the list does not exist', () => {
            expect(() => user.getList('TestList')).toThrowError("'TestList' list does not exist");
        });

        it('should return the list', async () => {
            for (let i = 0; i < 55; i++) {
                await user.addTodo('TestList', todo);
            }
            expect(user.getList('TestList')).toHaveLength(55);
        });
    });
});
