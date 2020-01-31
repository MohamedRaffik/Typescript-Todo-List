import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import http from 'http';
import { Context, createContext } from './context';
import { API } from './routes';

const PORT = process.env.PORT || 5000;

export const start = async (): Promise<[http.Server, Context]> => {
    const app = express()
    const context = await createContext()

    app.use(express.json());
    app.use(compression());
    app.use(cookieParser(process.env.SECRET_KEY));
    app.use('/api', API(context));

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
