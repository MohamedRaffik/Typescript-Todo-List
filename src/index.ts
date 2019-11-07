import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import createContext from './context';
import API from './routes';

const app = express();
const PORT = process.env.PORT || 5000;

(async () => {
	const context = await createContext();

	app.use(compression());
	app.use(cookieParser());
	app.use(express.json());
	app.use('/api', API(context));

	app.use('/', (req: Request, res: Response) => {
		res.status(200).json({ message: 'HI' });
	});

	app.listen(PORT, () => {
		// tslint:disable-next-line: no-console
		console.log(`Listening on Port ${PORT}`);
	});
})();
