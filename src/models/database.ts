import MongoClient from 'mongodb';

export default async () => {
	const client = await MongoClient.connect(String(process.env.MONGODB_URI), {
		useNewUrlParser: true,
		useUnifiedTopology: true
	});
	return client.db();
};
