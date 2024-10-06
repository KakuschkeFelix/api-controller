import * as v from 'valibot';

export const dateStringSchema = v.custom<Date>((value) => {
    if (typeof value !== 'string') {
        return false;
    }
    const date = new Date(value);
    return !isNaN(date.getTime());
});