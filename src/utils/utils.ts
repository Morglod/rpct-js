import { PodJSON, PlainUUID } from './types';

export function cloneJSON<T extends PodJSON>(x: T): T {
    return JSON.parse(JSON.stringify(x));
}

export type UUIDGenerator = (() => PlainUUID);
export type UUIDGeneratorFactory = () => UUIDGenerator;

export function simpleCountGenerator(initial: number = 0): () => number {
    let counter = initial;

    return () => {
        if (counter >= Number.MAX_SAFE_INTEGER - 5) {
            counter = 0;
        }
        counter++;
        return counter;
    };
}

export function unsafeUUIDGenerator(): UUIDGenerator {
    return () => {
        return `${Date.now()}-${Math.floor(Math.random() * 9999).toString(16)}-${Math.floor(Math.random() * 9999).toString(16)}`;
    };
}
