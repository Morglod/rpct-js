import { ApiMiddleware, Api } from "../api";
export declare const CALLBACK_OPTIONS_SYMBOL: unique symbol;
export declare type CallbackOptions = {
    /** bind remote callback forever, use `middleware.freeCallback` to dispose it */
    noAutoFree?: boolean;
};
export declare const defaultCallbackOptions: <T extends (...args: any) => any>(func: T) => CallbackOptions;
export declare const appendCallbackOptions: <T extends (...args: any) => any>(func: T, opts: CallbackOptions) => T;
/** bind remote callback forever, use `middleware.freeCallback` to dispose it */
export declare const bindCallback: <T extends (...args: any) => any>(func: T) => T;
export declare const callbacksMiddleware: () => {
    middleware: ApiMiddleware<Api<any, any>, any, any>;
    freeCallback: (cb: Function) => void;
};
