import type { Context, Hono } from 'hono';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { secureHeaders } from 'hono/secure-headers';
import appRouter from '../routes';
import InitDatabase from './db';
import { errorHandler } from './errors';

export async function BootstrapServer(app: Hono) {
  await InitDatabase();
  console.log('✅ Database Connected!');

  app.use(cors());
  app.use(csrf());
  app.use(secureHeaders());

  app.route('/api/v1', appRouter);

  app.onError((err: Error, c: Context) => {
    return errorHandler(err, c);
  });
}
