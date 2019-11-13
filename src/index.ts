import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as Context from './context';
import * as API from './routes';

const PORT = process.env.PORT || 5000;

const StartServer = async () => {
	const app = express.default();
	const context = await Context.createContext();

	app.use(compression.default());
	app.use(cookieParser.default());
	app.use(express.json());
	app.use('/api', API.default(context));

	app.use('/', (req: express.Request, res: express.Response) => {
		res.status(200).json({ message: 'HI' });
	});
	return app;
};

StartServer().then(app =>
	app.listen(PORT, () => {
		// tslint:disable-next-line: no-console
		console.log(`Listening on Port ${PORT}`);
	})
);

export default StartServer;
