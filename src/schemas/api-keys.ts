import * as v from 'valibot';
import {dateStringSchema} from "./date";

export const ApiKeysCreateSchema = v.object({
    key: v.string(),
    expiresIn: v.pipe(v.custom<string>((value) => {
        if (typeof value !== 'string') return false;
        const numberRegex = /^[0-9]+$/;
        return numberRegex.test(value);
    }, 'expiresIn must be a number'), v.custom<string>((value: unknown) => {
        if (typeof value !== 'string') return false;
        const number = parseInt(value);
        return number > 0;
    }, 'expiresIn must be greater than 0')),
    issuedAt: v.pipe(dateStringSchema, v.maxValue(new Date())),
});