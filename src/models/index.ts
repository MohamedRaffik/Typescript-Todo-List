import * as Database from './database';
import * as User from './user';

export default async () => {
	const db = await Database.connect();

	return {
		db,
		User: User.UserClass
	};
};
