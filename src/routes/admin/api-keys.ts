import {Hono} from "hono";
import {flatten} from "valibot";
import {APIKeysWrapper} from "../../db/api-keys";
import {ApiKeysCreateSchema} from "../../schemas/api-keys";
import {JSONCreator} from "../../helpers/json";
import {Prisma} from "@prisma/client";
import bcrypt from "bcrypt";
import {vValidator} from "@hono/valibot-validator";

const app = new Hono();

app.get('/', async (c) => {
    const result = await APIKeysWrapper.getAllAPIKeys();
    return c.json(result, result.ok ? 200 : result.status);
});

app.post('/', vValidator('form', ApiKeysCreateSchema, (result, c) => {
    if (!result.success) {
        return c.json(JSONCreator.createErrorJSON("Invalid data", flatten(result.issues), 400), 400);
    }
}), async (c) => {
    const {key, ...data} = c.req.valid('form');
    const currentKeys = await APIKeysWrapper.getAllAPIKeys();
    if (!currentKeys.ok) {
        return c.json(currentKeys, currentKeys.status);
    }
    for (const currentKey of currentKeys.data) {
        if (await bcrypt.compare(key, currentKey.keyHash)) {
            return c.json(JSONCreator.createErrorJSON("Key already exists", null, 400), 400);
        }
    }

    const keyHash = await bcrypt.hash(key, 10);
    const input: Prisma.ApiKeyCreateInput = {
        ...data,
        expiresIn: parseInt(data.expiresIn),
        keyHash,
    };
    const result = await APIKeysWrapper.createAPIKey(input);
    return c.json(result, result.ok ? 201 : result.status);
});

app.delete('/:id', async (c) => {
    const result = await APIKeysWrapper.deleteAPIKey(c.req.param('id'));
    return c.json(result, result.ok ? 204 : result.status);
});

export default app;