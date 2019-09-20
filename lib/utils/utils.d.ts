import { PodJSON, PlainUUID } from './types';
export declare function cloneJSON<T extends PodJSON>(x: T): T;
export declare type UUIDGenerator = (() => PlainUUID);
export declare type UUIDGeneratorFactory = () => UUIDGenerator;
export declare function simpleCountGenerator(): () => number;
export declare function unsafeUUIDGenerator(): UUIDGenerator;
