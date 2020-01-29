import mongodb from 'mongodb';
import { connect } from '../../models/database';
import { User, UserInfo, Todo } from '../../models/user';

describe('Unit Testing User Class', () => {
    let db: mongodb.Db;
    let client: mongodb.MongoClient;
    const info: UserInfo = {
        email: 'someemail@gmail.com',
        username: 'JohnnyBoy',
        password: 'password123'
    };

    beforeAll(async () => {
        const connection = await connect();
        db = connection.db;
        client = connection.client;
        try {
            await db.dropCollection('Users');
        } catch (err) {
            // tslint:disable-next-line:no-empty-line
        }
    });

    afterAll(async () => {
        try {
            await db.dropCollection('Users');
        } catch (err) {
            // tslint:disable-next-line:no-empty-line
        }
        await client.close();
    });

    it('should create a user, insert it into the database and retrieve the user', async () => {
        await User.create(db, info);
        const user = await User.get(db, info.email);
        expect(user).toBeInstanceOf(User);
        if (user) {
            expect(user.email).toEqual('someemail@gmail.com');
            expect(user.username).toEqual('JohnnyBoy');
            expect(user.authenticate('password123')).toEqual(true);
        }
    });

    it('should throw an error if an email is used with another account', async () => {
        const newInfo: UserInfo = {
            email: info.email,
            password: 'newpassword',
            username: 'newname'
        };
        await expect(User.create(db, newInfo)).rejects.toThrowError(RegExp('duplicate'));
    });

    it('should update user information in the database and be able to retrieve the update document', async () => {
        const todo: Todo = {
            title: 'Create TODO',
            notes: ['Note 1', 'Note 2'],
            created: Date.now()
        };
        const user = await User.get(db, info.email);
        expect(user).toBeInstanceOf(User);
        if (user) {
            expect(user.lists.Main.length).toEqual(0);
            await user.addTodo('Main', todo);
            const updatedUser = await User.get(db, info.email);
            expect(updatedUser).toBeInstanceOf(User);
            if (updatedUser) {
                expect(updatedUser.lists.Main.length).toEqual(1);
            }
        }
    });
});
