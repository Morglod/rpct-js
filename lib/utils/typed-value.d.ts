export declare function toTypedValue<T extends symbol>(value: any, symbolType: T): T;
export declare function fromTypedValue<T extends symbol, ObjT>(value: T, symbolType: T): ObjT;
