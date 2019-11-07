import { Router } from 'express';
import { Context } from '../context';
import Auth from './auth';

export default (context: Context) => {
	const APIRouter = Router();

	APIRouter.use('/auth', Auth(context));

	return APIRouter;
};
