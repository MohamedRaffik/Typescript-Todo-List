import { connect } from './database';
import { User } from './user';

export default async () => ({
    ...(await connect()),
    User: User
});
