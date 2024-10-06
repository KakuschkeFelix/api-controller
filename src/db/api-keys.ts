import {PrismaClient, Prisma} from "@prisma/client";
import client from "./prisma";
import {JSONCreator} from "../helpers/json";

export class APIKeysWrapper {
    static async createAPIKey(data: Prisma.ApiKeyCreateInput) {
        return client.apiKey.create({
            data
        }).then((key) => {
            return JSONCreator.createSuccessJSON(key);
        }).catch((e) => {
            console.error(e);
            return JSONCreator.createErrorJSON("Failed to create API key", e, 500);
        });
    }

    static async deleteAPIKey(id: string) {
        return client.apiKey.delete({
            where: {
                id
            }
        }).then(() => {
            return JSONCreator.createSuccessJSON(null);
        }).catch((e) => {
            return JSONCreator.createErrorJSON("Failed to delete API key", e, 500);
        });
    }

    static async getAllAPIKeys(data: Prisma.ApiKeyFindManyArgs = {}) {
        return client.apiKey.findMany(data).then((keys) => {
            return JSONCreator.createSuccessJSON(keys);
        }).catch((e) => {
            return JSONCreator.createErrorJSON("Failed to get API keys", e, 500);
        });
    }
}