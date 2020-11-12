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
    ask: (uuid: TicketListUUID | null) => TicketListAskResult<AnswerT>;
    /** will throw `TicketListAnswerError` on non exist uuid */
    answer: (uuid: TicketListUUID, answerValue: AnswerT, noUUIDCheck?: false | 'no uuid check') => void;
    pendingTickets: {
        [uuid in TicketListUUID]: (answer?: AnswerT, error?: string | Error | Symbol) => void;
    };
    hasUUID: (uuid: TicketListUUID) => boolean;
    rejectTicket: (uuid: TicketListUUID, ignoreErrors?: false | 'ignore errors') => void;
    /**
     * Now it will reset on Number.MAX_SAFE_INTEGER and travel pendingTickets keys till found free uuid
     */
    nextUUID: (() => TicketListUUID);
}
export {};
