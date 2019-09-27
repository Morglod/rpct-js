export declare function getObjectOptions<OptsT, ObjT extends object>(obj: ObjT, symbol: symbol, defaultOptions: ((obj: ObjT) => OptsT) | OptsT): OptsT;
export declare function setObjectOptions<OptsT, ObjT extends object>(obj: ObjT, symbol: symbol, options: ((obj: ObjT) => OptsT) | OptsT): ObjT;
