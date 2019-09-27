export function getObjectOptions<OptsT, ObjT extends object>(
    obj: ObjT,
    symbol: symbol,
    defaultOptions: ((obj: ObjT) => OptsT)|OptsT
): OptsT {
    let opts = (obj as any)[symbol];
    if (!opts) opts = typeof defaultOptions === 'function' ? (defaultOptions as Function)(obj) : defaultOptions;
    return opts;
}

export function setObjectOptions<OptsT, ObjT extends object>(
    obj: ObjT,
    symbol: symbol,
    options: ((obj: ObjT) => OptsT)|OptsT
): ObjT {
    (obj as any)[symbol] = typeof options === 'function' ? (options as Function)(obj) : options;
    return obj;
}