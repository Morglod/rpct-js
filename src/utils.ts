import { TicketListUUID } from "./ticket-list";

export function cloneJSON(x: any) {
    return JSON.parse(JSON.stringify(x));
}

export type UUIDGenerator = (() => TicketListUUID);
export type UUIDGeneratorFactory = () => UUIDGenerator;

export function simpleUUIDGenerator(): UUIDGenerator {
    let counter = 0;

    return () => {
        if (counter >= Number.MAX_SAFE_INTEGER - 5) {
            counter = 0;
        }
        counter++;
        return counter;
    };
}