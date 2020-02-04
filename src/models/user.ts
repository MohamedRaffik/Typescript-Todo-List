import * as bcrypt from 'bcrypt';
import * as mongodb from 'mongodb';

export interface Todo {
    title: string;
    notes: string[];
    created: number;
    completed?: boolean;
    deadline?: number;
    reminder?: number;
}

export interface TodoList {
    Main: Todo[];
    [list: string]: Todo[];
}

export interface UserInfo {
    email: string;
    username: string;
    password: string;
    lists?: TodoList;
}

export interface UserUpdate {
    username?: string;
    password?: string;
    lists?: TodoList;
}

export interface UpdateTodo {
    title?: string;
    notes?: string[];
    completed?: boolean;
    deadline?: number;
    reminder?: number;
}

export class User {
    public static get = async (db: mongodb.Db, email: string) => {
        const doc = await db.collection('Users').findOne({ _id: email });
        if (!doc) {
            return undefined;
        }
        const { _id, ...info } = doc;
        return new User(db, { email: _id, ...info });
    }

    public static create = async (db: mongodb.Db, info: UserInfo) => {
        if (info.password.length <= 8) {
            throw Error('Password length is too short, must be greater than 8 characters');
        }
        info.password = bcrypt.hashSync(info.password, 10);
        const user = new User(db, info);
        const { email, ...userInfo } = user;
        delete userInfo.db;
        await db.collection('Users').insertOne({ _id: email, ...userInfo });
        return user;
    }

    public email: string;
    public username: string;
    public password: string;
    public lists: TodoList;
    public db: mongodb.Db;

    constructor(db: mongodb.Db, info: UserInfo) {
        this.email = info.email;
        this.username = info.username;
        this.password = info.password;
        this.lists = info.lists || { Main: [] };
        this.db = db;
    }

    public authenticate(password: string) {
        return bcrypt.compareSync(password, this.password);
    }

    public async addTodo(list: string, todo: Todo) {
        todo.completed = false;
        this.validListName(list);
        if (!(list in this.lists)) {
            await this.createList(list);
        }
        this.validAddOperation(todo, list);
        this.insertItem(todo, list);
        await this.update({ lists: this.lists });
    }

    public async deleteTodo(list: string, id: number) {
        this.validOperation(list, id);
        this.lists[list].splice(id, 1);
        await this.update({ lists: this.lists });
    }

    public async updateTodo(list: string, id: number, update: UpdateTodo) {
        this.validOperation(list, id);
        const [todo] = this.lists[list].splice(id, 1);
        Object.keys(update).forEach((key) => {
            if (update[key] !== undefined) {
                todo[key] = update[key];
            }
        });
        this.validAddOperation(todo, list);
        this.insertItem(todo, list);
        await this.update({ lists: this.lists });
    }

    public async moveTodo(list: string, id: number, newList: string) {
        this.validOperation(list, id);
        this.validOperation(newList);
        if (list === newList) {
            throw Error('Cannot move within the same list');
        }
        const [todo] = this.lists[list].splice(id, 1);
        this.validAddOperation(todo, list);
        this.insertItem(todo, newList);
        await this.update({ lists: this.lists });
    }

    public async createList(list: string) {
        if (list in this.lists) {
            throw Error(`'${list}' list already exists`);
        }
        if (Object.keys(this.lists).length === 50) {
            throw Error('Maximum number of lists reached');
        }
        if (list.length > 30) {
            throw Error('Listname must be less than or equal to 30 characters');
        }
        this.lists[list] = [];
        await this.update({ lists: this.lists });
    }

    public async deleteList(list: string) {
        this.validOperation(list);
        if (list === 'Main') {
            throw Error('Cannot delete \'Main\' list');
        }
        delete this.lists[list];
        await this.update({ lists: this.lists });
    }

    public async clearList(list: string) {
        this.validOperation(list);
        this.lists[list].splice(0, this.lists[list].length);
        await this.update({ lists: this.lists });
    }

    public async renameList(list: string, newList: string) {
        this.validOperation(list);
        if (list === 'Main') {
            throw Error('Cannot rename \'Main\' list');
        }
        if (newList in this.lists) {
            throw Error(
                `Cannot rename '${list}' list to '${newList}', '${newList}' list already exists`
            );
        }
        this.validListName(newList);
        const oldList = this.lists[list];
        delete this.lists[list];
        await this.createList(newList);
        this.lists[newList] = oldList;
        await this.update({ lists: this.lists });
    }

    public getList(list: string) {
        this.validOperation(list);
        return this.lists[list];
    }

    public getLists() {
        return Object.keys(this.lists).reduce((prev, curr) => {
            prev[curr] = this.getList(curr);
            return prev;
        }, {});
    }

    private validOperation(list: string, id?: number) {
        if (!(list in this.lists)) {
            throw Error(`'${list}' list does not exist`);
        }
        if (id !== undefined) {
            if (!(0 <= id && id < this.lists[list].length)) {
                throw Error(`Item does not exist in '${list}' list`);
            }
        }
    }

    private validAddOperation(todo: Todo, list: string) {
        if (this.lists[list].length === 100) {
            throw Error(`'${list}' list has reached its Todo Item limit`);
        }
        if (todo.notes.length > 10) {
            throw Error('Todo Item must have less than or equal to 10 note entries');
        }
    }

    private validListName(list: string) {
        // Tests if string is empty or has only whitespace
        if (!/\S/.test(list)) {
            throw Error(`'${list}' is not a valid list name`);
        }
    }

    private insertItem(todo: Todo, list: string) {
        if (todo.deadline === undefined) {
            this.lists[list].push(todo);
            return;
        }
        let i = 0;
        while (i < this.lists[list].length) {
            const deadline = this.lists[list][i].deadline;
            if (deadline) {
                if (todo.deadline < deadline) {
                    break;
                }
            } else {
                break;
            }
            i++;
        }
        this.lists[list].splice(i, 0, todo);
    }

    private async update(update: UserUpdate) {
        await this.db.collection('Users').updateOne({ _id: this.email }, { $set: update });
    }
}
