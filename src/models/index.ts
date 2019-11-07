import connect from './database';
import User from './user';

export default async () => {
	const db = await connect();

	return {
		db,
		User
	};
};
