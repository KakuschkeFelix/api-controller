type JSONSuccessPayload<T> = {
    ok: true;
    data: T;
}

type JSONErrorPayload<T = never> = {
    ok: false;
    message: string;
    data?: T;
    status: 400 | 401 | 403 | 404 | 500;
}

export class JSONCreator {
    static createErrorJSON<K = never>(message: string, data: K, status: 400 | 401 | 403 | 404 | 500): JSONErrorPayload<K> {
        return {
            ok: false,
            message,
            data,
            status
        }
    }

    static createSuccessJSON<T>(data: T): JSONSuccessPayload<T> {
        return {
            ok: true,
            data
        }
    }
}