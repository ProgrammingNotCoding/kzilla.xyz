import { Hono } from 'hono';
import linkRouter from './links-router';

const appRouter = new Hono();

appRouter.route('/links', linkRouter);

export default appRouter;
