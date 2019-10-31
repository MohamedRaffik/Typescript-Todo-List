import MongoClient from 'mongodb';
import fetch from 'node-fetch';

const MONGODB_URI = process.env.MONGODB_URI;

interface Credentials {
	access_token: string;
	expires_at: number;
}

interface Collections {
	Music: object[];
	Gaming: object[];
	Sports: object[];
	Entertainment: object[];
	Lifestyle: object[];
	Knowledge: object[];
	Society: object[];
}

interface UserInfo {
	email: string;
	credentials: Credentials;
	subscriptions?: object[];
	collections?: Collections;
	ready?: boolean;
}

interface Update {
	credentials?: Credentials;
	subscriptions?: object[];
	collections?: Collections;
	ready?: boolean;
}

const UserClass = (db: MongoClient.Db) =>
	class User {
		public static async get(email: string): Promise<User | undefined> {
			const user = await db.collection('Users').findOne({ _id: email });
			return user ? new User({ ...user, email }) : undefined;
		}

		public info: UserInfo;

		constructor(info: UserInfo) {
			this.info = {
				email: info.email,
				credentials: info.credentials,
				subscriptions: info.subscriptions || [],
				collections: info.collections || {
					Music: [{}],
					Gaming: [{}],
					Sports: [{}],
					Entertainment: [{}],
					Lifestyle: [{}],
					Knowledge: [{}],
					Society: [{}]
				},
				ready: info.ready || false
			};
		}

		public async insert(): Promise<User> {
			const { email, ...doc } = this.info;
			await db.collection('Users').insertOne({ ...doc, _id: email });
			const user = await User.get(email);
			if (user === undefined) {
				throw Error('Failed to retrieve account after insert');
			}
			return user;
		}

		public async update(attributes: Update): Promise<User> {
			await db.collection('Users').updateOne({ _id: this.info.email }, { $set: attributes });
			const user = await User.get(this.info.email);
			if (user === undefined) {
				throw Error('Failed to retrieve account after update');
			}
			return user;
		}

		public async getSubscriptions() {
			const topicMap = {
				'/m/019_rr': 'Lifestyle',
				'/m/01k8wb': 'Knowledge',
				'/m/02jjt': 'Entertainment',
				'/m/04rlf': 'Music',
				'/m/06ntj': 'Sports',
				'/m/098wr': 'Society',
				'/m/0bzvm2': 'Gaming'
			};

			const getYouTubeSubscriptions = async (page: string | null) => {
				if (page === null) {
					try {
						this.update({
							subscriptions: this.info.subscriptions,
							collections: this.info.collections,
							ready: true
						});
						return;
					} catch (err) {
						console.error(err);
						return;
					}
				}
				try {
					const authHeader = {
						headers: {
							Authorization: `Bearer ${this.info.credentials.access_token}`
						}
					};
					const subResponse = await fetch(
						`https://www.googleapis.com/youtube/v3/subscriptions?part=snippet&mine=true&maxResults=50&pageToken=${page}`,
						authHeader
					);
					const subJson = await subResponse.json();
					const subs = subJson.items.reduce((prev: any, curr: any) => {
						prev[curr.snippet.resourceId.channelId] = {
							subscribed_on: curr.snippet.publishedAt,
							upload_playlist: null
						};
						return prev;
					}, {});

					const channelResponse = await fetch(
						`https://www.googleapis.com/youtube/v3/channels?part=topicDetails,contentDetails&id=${Object.keys(
							subs
						).join(',')}&maxResults=50&key=${process.env.GOOGLE_API_KEY}`
					);
					const channelJson = await channelResponse.json();
					channelJson.items.forEach((item: any) => {
						if ('topicDetails' in item) {
							item.topicDetails.topicIds.forEach((topic: string) => {
								if (topic in topicMap) {
									const t: string = topicMap[topic];
									const { id } = item;
									// prettier-ignore
									if (this.info.collections) {
                                            if (this.info.collections[t][this.info.collections[t].length - 1].length === 50) {
                                                this.info.collections[t].push({});
                                            }
                                            this.info.collections[t][this.info.collections[t].length - 1][id] = null;
                                        }
								}
							});
						}
					});
					if (this.info.subscriptions) {
						this.info.subscriptions.push(subs);
					}

					if ('nextPageToken' in subJson) {
						getYouTubeSubscriptions(subJson.nextPageToken);
					} else {
						getYouTubeSubscriptions(null);
					}
				} catch (err) {
					console.error(err);
				}
			};
			await getYouTubeSubscriptions('');
		}
	};

const DatabaseConnection = async () => {
	if (MONGODB_URI) {
		const client = await MongoClient.connect(MONGODB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true
		});
		const db = client.db();
		return db;
	}
	throw Error('MONGODB_URI is not specified');
};

export default UserClass;
export { DatabaseConnection, UserInfo };
