import {Hono} from "hono";
import apiKeys from "./api-keys";

const app = new Hono();

app.route('/api-keys', apiKeys);

export default app;