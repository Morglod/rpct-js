import { setObjectOptions, getObjectOptions } from "./object-options";

const typedValue = Symbol('typed value');

export function toTypedValue<T extends symbol>(value: any, symbolType: T): T {
    return setObjectOptions(value, typedValue, true) as T;
}

export function fromTypedValue<T extends symbol, ObjT>(value: T, symbolType: T): ObjT {
    const isTyped = getObjectOptions(value as any, typedValue, false);
    if (!isTyped) {
        throw new Error('fromTypedValue for not typed value');
    }

    return value as any as ObjT;
}