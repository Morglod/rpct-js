export type TicketListUUID = string|number;

type TicketListAskResult<AnswerT> = {
    uuid: TicketListUUID,
    answer: Promise<AnswerT>
};

/** Error with uuid field */
export class TicketListAnswerError extends Error {
    constructor(
        message: string,
        public uuid: TicketListUUID
    ) {
        super(message);
    }
}

/**
 * ask->Promise<uuid, answer> solver
 */
export class TicketList<AnswerT> {
    static TICKET_REJECTED = Symbol('TICKET_REJECTED');

    /** uuid=null to use TicketList.nextUUID */
    ask = (uuid: TicketListUUID|null): TicketListAskResult<AnswerT> => {
        const _uuid = (uuid === null) ? this.nextUUID() : uuid;

        const answerPromise = new Promise<AnswerT>((resolve, reject) => {
            this.pendingTickets[_uuid] = (answer, error) => {
                if (answer || !error) {
                    delete this.pendingTickets[_uuid];
                    resolve(answer);
                }
                else reject(error);
            };
        });

        return {
            uuid: _uuid,
            answer: answerPromise,
        };
    };

    /** will throw `TicketListAnswerError` on non exist uuid */
    answer = (uuid: TicketListUUID, answerValue: AnswerT, noUUIDCheck: false|'no uuid check' = false) => {
        if (!noUUIDCheck && !this.hasUUID(uuid)) {
            throw new TicketListAnswerError(`no pending ticket for uuid="${uuid}"`, uuid);
        }

        const ticket = this.pendingTickets[uuid];
        delete this.pendingTickets[uuid];

        ticket(answerValue);
    };

    pendingTickets: {
        [uuid in TicketListUUID]: (answer?: AnswerT, error?: string|Error|Symbol) => void
    } = {};

    hasUUID = (uuid: TicketListUUID) => (uuid in this.pendingTickets);

    rejectTicket = (
        uuid: TicketListUUID,
        ignoreErrors: false|'ignore errors' = false,
    ) => {
        if (!this.hasUUID(uuid)) return;
        const ticket = this.pendingTickets[uuid];
        delete this.pendingTickets[uuid];

        if (ignoreErrors === 'ignore errors') {
            try {
                ticket(undefined, TicketList.TICKET_REJECTED);
            } catch {}
        } else {
            ticket(undefined, TicketList.TICKET_REJECTED);
        }
    };

    /**
     * You should use uuidv4+ for heavy rpc services
     * Now it will reset on Number.MAX_SAFE_INTEGER and travel pendingTickets keys till found free uuid
     */
    nextUUID: (() => TicketListUUID) = (() => {
        let counter = 0;

        return () => {
            if (counter >= Number.MAX_SAFE_INTEGER - 5) {
                counter = 0;
            }
            do {
                counter++;
            } while (this.hasUUID(counter));
            return counter;
        };
    })();
}