import {Hono} from "hono";
import {logger} from "hono/logger";
import admin from "../routes/admin";
import {bearerAuth} from 'hono/bearer-auth';
import bcrypt from "bcrypt";
import {APIKeysWrapper} from "../db/api-keys";
import {jwt} from "hono/jwt";

type APIConfig = {
    apiPrefix: string;
    apiRoutes: {
        path: string;
        route: Hono;
        auth: 'API_KEY' | 'JWT' | 'NONE';
    }[];
    adminPrefix: string;
    adminSecret: string;
    adminRoutes?: {
        path: string;
        route: Hono;
    }[];
}


export class API {
    private app: Hono;

    constructor(config: APIConfig) {
        this.app = new Hono();
        this.app.use(logger());

        this.setupAdminRoutes(config);
        this.setupAPIRoutes(config);
    }

    private setupAdminRoutes(config: APIConfig) {
        this.app.use(`${config.adminPrefix}/*`, bearerAuth({
            token: config.adminSecret
        }));

        const adminRouteHandler = admin;

        (config.adminRoutes ?? []).forEach(({path, route}) => {
            if (path === config.adminPrefix) return;
            adminRouteHandler.route(path, route);
        });

        this.app.route(config.adminPrefix, adminRouteHandler);
    }

    private setupAPIRoutes(config: APIConfig) {
        const apiApp = new Hono();

        for (const {path, route, auth} of config.apiRoutes) {
            switch (auth) {
                case 'API_KEY':
                    apiApp.use(`${path}/*`, bearerAuth({
                        verifyToken: this.verifyApiKey
                    }));
                    break;
                case 'JWT':
                    apiApp.use(`${path}/*`, jwt({
                        secret: process.env.JWT_SECRET!,
                    }));
                    break;
                case 'NONE':
                    break;
            }

            apiApp.route(`${path}`, route);
        }

        this.app.route(config.apiPrefix, apiApp);
    }

    private async verifyApiKey(token: string): Promise<boolean> {
        return APIKeysWrapper.getAllAPIKeys().then(async (result) => {
            if (!result.ok) {
                return false;
            }

            for (const key of result.data) {
                if (await bcrypt.compare(token, key.keyHash)) {
                    const expiryDate = new Date(key.issuedAt);
                    expiryDate.setTime(expiryDate.getTime() + key.expiresIn * 1000);
                    return expiryDate <= new Date();
                }
            }
            return false;

        }).catch((e) => {
            console.error("Error verifying token:", e);
            return false;
        });
    }

    get fetch() {
        return this.app.fetch;
    }
}