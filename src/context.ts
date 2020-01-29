import mongodb from 'mongodb';
import Models from './models';
import { User } from './models/user';

export interface Context {
    User: typeof User;
    db: mongodb.Db;
    client: mongodb.MongoClient;
}

export const createContext = async () => {
    return {
        ...(await Models())
    };
};
