import { ApiMiddleware, Api } from "../api";
export declare const callbacksMiddleware: () => ApiMiddleware & {
    api: Api<any, any>;
    callBoundCallbacks: {
        [requestId: number]: string[];
    };
    /** temp storage for remote callbacks */
    callbacks: {
        [uuid: string]: Function;
    };
};
