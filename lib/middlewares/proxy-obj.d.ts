import { ApiMiddleware, Api } from "../api";
import { PlainUUID, PromisifyFuncReturnType } from "../utils/types";
export declare type ProxyApiMethods = {
    $proxy_callField(objId: PlainUUID, path: string, args: any[]): any;
    $proxy_getField(objId: PlainUUID, path: string): any;
    $proxy_setField(objId: PlainUUID, path: string, value: any): boolean;
    $proxy_canProxify(objId: PlainUUID, path: string): boolean;
    $proxy_canCall(objId: PlainUUID, path: string): boolean;
};
export declare const proxyObjMiddleware: () => {
    middleware: ApiMiddleware<Api<any, any>, any, any>;
    uuidGenerator: () => string | number;
    api: Api<ProxyApiMethods, ProxyApiMethods>;
    boundObjects: {
        [objectId: string]: any;
    };
    serveProxyObj: <T extends object>(obj: T) => RemoteProxyObjField<T>;
};
export declare const PROXY_OBJ_MARKER: unique symbol;
declare type RemoteProxyObjField<FieldT> = FieldT extends void | never ? never : FieldT extends (...args: any[]) => any ? PromisifyFuncReturnType<FieldT> : FieldT extends any[] ? () => Promise<FieldT> : FieldT extends {
    [x: string]: any;
} ? ({
    [k in keyof FieldT]: RemoteProxyObjField<FieldT[k]>;
}) : (update?: FieldT) => Promise<FieldT>;
export declare type RemoteProxyObj<T> = RemoteProxyObjField<T>;
export {};
