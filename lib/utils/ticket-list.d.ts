export declare type TicketListUUID = string | number;
declare type TicketListAskResult<AnswerT> = {
    uuid: TicketListUUID;
    answer: Promise<AnswerT>;
};
/** Error with uuid field */
export declare class TicketListAnswerError extends Error {
    uuid: TicketListUUID;
    constructor(message: string, uuid: TicketListUUID);
}
/**
 * ask->Promise<uuid, answer> solver
 */
export declare class TicketList<AnswerT> {
    static TICKET_REJECTED: symbol;
    /** uuid=null to use TicketList.nextUUID */
    ask: (uuid: string | number | null) => TicketListAskResult<AnswerT>;
    /** will throw `TicketListAnswerError` on non exist uuid */
    answer: (uuid: string | number, answerValue: AnswerT, noUUIDCheck?: false | "no uuid check") => void;
    pendingTickets: {
        [uuid in TicketListUUID]: (answer?: AnswerT, error?: string | Error | Symbol) => void;
    };
    hasUUID: (uuid: string | number) => boolean;
    rejectTicket: (uuid: string | number, ignoreErrors?: false | "ignore errors") => void;
    /**
     * You should use uuidv4+ for heavy rpc services
     * Now it will reset on Number.MAX_SAFE_INTEGER and travel pendingTickets keys till found free uuid
     */
    nextUUID: (() => TicketListUUID);
}
export {};
