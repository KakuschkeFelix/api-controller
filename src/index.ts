import {serve} from '@hono/node-server'
import {Hono} from 'hono'
import {API} from "./api";
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const app = new Hono();

app.get('/', (c) => c.text('Hello, world!'));

const api = new API({
    apiPath: '/api',
    apiRoutes: app,
    adminSecret: process.env.ADMIN_SECRET!
});

serve({
    fetch: api.fetch,
    port: 3000,
})
