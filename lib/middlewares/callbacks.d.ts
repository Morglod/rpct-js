import { ApiMiddleware, Api } from "../api";
export declare const callbacksMiddleware: () => {
    middleware: ApiMiddleware<Api<any, any>, any, any>;
    freeCallback: (cb: Function) => void;
};
