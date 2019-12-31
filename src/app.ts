import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as http from 'http';
import * as Context from './context';
import * as API from './routes';

const PORT = process.env.PORT || 5000;

export const start = async (): Promise<[http.Server, Context.Context]> => {
	const app = express.default();
	const context = await Context.createContext();

	app.use(express.json());
	app.use(compression.default());
	app.use(cookieParser.default(process.env.SECRET_KEY));
	app.use('/api', API.default(context));

	app.get('/', (req: express.Request, res: express.Response) => {
		res.json({ message: 'Hello from Todo List API' });
	});

	return await new Promise(resolve => {
		const httpServer = app.listen(PORT, () => {
			httpServer.on('close', async () => await context.client.close());
			resolve([httpServer, context]);
		});
	});
};
