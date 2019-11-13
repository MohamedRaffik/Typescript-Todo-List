import * as mongodb from 'mongodb';

export const connect = async () => {
	const client = await mongodb.MongoClient.connect(String(process.env.MONGODB_URI), {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
	return client.db();
};
