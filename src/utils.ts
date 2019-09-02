import { TicketListUUID } from "./ticket-list";

export function cloneJSON(x: any) {
    return JSON.parse(JSON.stringify(x));
}

export type UUIDGenerator = (() => TicketListUUID);
export type UUIDGeneratorFactory = () => UUIDGenerator;

export function simpleCountGenerator(): UUIDGenerator {
    let counter = 0;

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
