type _POD_ = string|number|boolean|undefined|null;
type _POD_A = _POD_[]|_POD_;

export type PodJSON =
    _POD_A|
    { [x in string|number]: PodJSON }|
    { [x in string|number]: PodJSON[] }|
    { [x in string|number]: PodJSON }[]|
    { [x in string|number]: PodJSON[] }[]
;

export type PlainUUID = string|number;

export type PromisifyFuncReturnType<
    FuncT extends (...args: any[]) => any,
    FuncReturn = ReturnType<FuncT>,
> =
    FuncReturn extends Promise<any> ? ((...args: Parameters<FuncT>) => FuncReturn) :
        (...args: Parameters<FuncT>) => Promise<FuncReturn>
;