import { Db } from 'mongodb';
import Models from './models';
import User from './models/user';

export interface Context {
	User: typeof User;
	db: Db;
}

export default async () => {
	return {
		...(await Models())
	};
};
