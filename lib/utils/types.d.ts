declare type _POD_ = string | number | boolean | undefined | null;
declare type _POD_A = _POD_[] | _POD_;
export declare type PodJSON = _POD_A | {
    [x in string | number]: PodJSON;
} | {
    [x in string | number]: PodJSON[];
} | {
    [x in string | number]: PodJSON;
}[] | {
    [x in string | number]: PodJSON[];
}[];
export declare type PlainUUID = string | number;
export declare type PromisifyFuncReturnType<FuncT extends (...args: any[]) => any, FuncReturn = ReturnType<FuncT>> = FuncReturn extends Promise<any> ? ((...args: Parameters<FuncT>) => FuncReturn) : (...args: Parameters<FuncT>) => Promise<FuncReturn>;
export {};
