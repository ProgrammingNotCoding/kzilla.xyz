import type { Hono } from 'hono';
import appRouter from '../routes';
import InitDatabase from './db';

export async function BootstrapServer(app: Hono) {
  await InitDatabase();
  console.log('✅ Database Connected!');

  app.get('/', c => {
    return c.text('Hello Hono!');
  });

  app.route('api', appRouter);
}
