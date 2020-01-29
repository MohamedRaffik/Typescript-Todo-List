import express from 'express';
import { Context } from '../context';
import { Router as AuthRouter } from './auth';
import { Router as ListRouter } from './list';

export const API = (context: Context) => {
    const APIRouter = express.Router();

    APIRouter.use('/auth', AuthRouter(context));
    APIRouter.use('/list', ListRouter(context));

    return APIRouter;
};
