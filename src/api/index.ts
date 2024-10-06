import {Hono} from "hono";
import {logger} from "hono/logger";
import admin from "../routes/admin";
import {bearerAuth} from 'hono/bearer-auth';
import bcrypt from "bcrypt";
import {APIKeysWrapper} from "../db/api-keys";

type APIConfig = {
    apiPath: string;
    apiRoutes: Hono;
    adminSecret: string;
}

export class API {
    private app: Hono;

    constructor(config: APIConfig) {
        this.app = new Hono();
        this.app.use(logger());

        this.app.use('/admin/*', bearerAuth({
            token: config.adminSecret
        }));

        this.app.route('/admin', admin);

        this.app.use(`${config.apiPath}/*`, bearerAuth({
            verifyToken: async (token) => {
                const result = await APIKeysWrapper.getAllAPIKeys();

                if (!result.ok) {
                    return false;
                }
                for (const key of result.data) {
                    if (await bcrypt.compare(token, key.keyHash)) {
                        const expiryDate = new Date(key.issuedAt);
                        expiryDate.setTime(expiryDate.getTime() + key.expiresIn * 1000);
                        return expiryDate >= new Date();

                    }
                }
                return false;
            }
        }));

        this.app.route(config.apiPath, config.apiRoutes);
    }

    get fetch() {
        return this.app.fetch;
    }
}