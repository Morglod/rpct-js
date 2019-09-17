import { TicketListUUID } from "./ticket-list";
import { PodJSON } from "./types";
export declare function cloneJSON<T extends PodJSON>(x: T): T;
export declare type UUIDGenerator = (() => TicketListUUID);
export declare type UUIDGeneratorFactory = () => UUIDGenerator;
export declare function simpleCountGenerator(): UUIDGenerator;
export declare function unsafeUUIDGenerator(): UUIDGenerator;
