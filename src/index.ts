import compression from 'compression';
import cookieParser from 'cookie-parser';
import express, { Request, Response } from 'express';
import path from 'path';
import UserClass, { DatabaseConnection } from './models';

const app = express();
const PORT = process.env.PORT || 5000;

(async () => {
    app.use(compression());
    app.use(cookieParser());
    app.use(express.json());

    app.use('/', (req: Request, res: Response) => {
        res.status(200).json({ message: 'HI' });
    });

    app.listen(PORT, () => {
        // tslint:disable-next-line: no-console
        console.log(`Listening on Port ${PORT}`);
    });
})().catch(err => console.error(err));
