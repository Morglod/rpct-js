import { TicketListUUID } from "./ticket-list";
export declare function cloneJSON(x: any): any;
export declare type UUIDGenerator = (() => TicketListUUID);
export declare type UUIDGeneratorFactory = () => UUIDGenerator;
export declare function simpleCountGenerator(): UUIDGenerator;
export declare function unsafeUUIDGenerator(): UUIDGenerator;
