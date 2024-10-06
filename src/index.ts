import {serve} from '@hono/node-server'
import {Hono} from 'hono'
import {API} from "./api";
import dotenv from 'dotenv';
import {sign} from "hono/jwt";

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const jwtTest = new Hono();
jwtTest.get('/', (c) => c.text('Hello, world!'));

const apiTest = new Hono();
apiTest.get('/', async (c) => c.json({token: await sign({
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        iat: Math.floor(new Date().getTime() / 1000),
        id: 'test',
    }, process.env.JWT_SECRET!)}));

const noneTest = new Hono();
noneTest.get('/', (c) => c.text('Hello, world!'));

const api = new API({
    apiPrefix: '/api',
    apiRoutes: [
        {
            path: '/test',
            route: apiTest,
            auth: 'API_KEY'
        },
        {
            path: '/jwt-test',
            route: jwtTest,
            auth: 'JWT',
        },
        {
            path: '/none-test',
            route: noneTest,
            auth: 'NONE',
        }
    ],
    adminSecret: process.env.ADMIN_SECRET!
});

serve({
    fetch: api.fetch,
    port: 3000,
})
