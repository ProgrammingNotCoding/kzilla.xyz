import { Hono } from 'hono';

const linkRouter = new Hono();

linkRouter.get('/:id', c => c.json(`test get ${c.req.param('id')}`));

export default linkRouter;
