import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as http from 'http';
import * as Context from './context';
import * as API from './routes';

const PORT = process.env.PORT || 5000;

export const StartServer = async (): Promise<[express.Application, http.Server]> => {
	const app = express.default();
	const context = await Context.createContext();

	app.use(express.json());
	app.use(compression.default());
	app.use(cookieParser.default());
	app.use('/api', API.default(context));

	app.get('/', (req: express.Request, res: express.Response) => {
		res.status(200).json({ message: 'HI' });
	});

	return await new Promise(resolve => {
		const httpServer = app.listen(PORT, () => {
			httpServer.on('close', async () => await context.client.close());
			resolve([app, httpServer]);
		});
	});
};
