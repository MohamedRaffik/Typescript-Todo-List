import { Db } from 'mongodb';
import User, { TodoList, UserUpdate } from '../models/user';

export class MockResponse {
	public status(code: number) {
		return this;
	}
	public json(object: object) {
		return;
	}
}

export class MockRequest {
	public body: object;
	constructor() {
		this.body = {};
	}
}

class Database {
	public db: object;

	constructor() {
		this.db = {};
	}

	public async dropCollection(name: string) {
		delete this.db[name];
	}

	public collection(name: string) {
		if (!(name in this.db)) {
			this.db[name] = {};
		}
		return {
			findOne: async (query: { _id: string }) => this.db[name][query._id],
			insertOne: async (insert: {
				_id: string;
				username: string;
				password: string;
				lists: TodoList;
			}) => {
				if (insert._id in this.db[name]) {
					throw Error('Duplicate key');
				}
				this.db[name][insert._id] = insert;
				return this.db[name][insert._id];
			},
			updateOne: async (query: { _id: string }, update: { $set: UserUpdate }) => {
				Object.entries(update.$set).forEach(pair => {
					const [key, value] = pair;
					this.db[name][query._id][key] = value;
				});
			}
		};
	}
}

export default () => {
	return {
		User,
		db: (new Database() as unknown) as Db
	};
};
