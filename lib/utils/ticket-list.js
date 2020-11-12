"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketList = exports.TicketListAnswerError = void 0;
/** Error with uuid field */
class TicketListAnswerError extends Error {
    constructor(message, uuid) {
        super(message);
        this.uuid = uuid;
    }
}
exports.TicketListAnswerError = TicketListAnswerError;
/**
 * ask->Promise<uuid, answer> solver
 */
class TicketList {
    constructor() {
        /** uuid=null to use TicketList.nextUUID */
        this.ask = (uuid) => {
            const _uuid = (uuid === null) ? this.nextUUID() : uuid;
            const answerPromise = new Promise((resolve, reject) => {
                this.pendingTickets[_uuid] = (answer, error) => {
                    if (answer || !error) {
                        delete this.pendingTickets[_uuid];
                        resolve(answer);
                    }
                    else
                        reject(error);
                };
            });
            return {
                uuid: _uuid,
                answer: answerPromise,
            };
        };
        /** will throw `TicketListAnswerError` on non exist uuid */
        this.answer = (uuid, answerValue, noUUIDCheck = false) => {
            if (!noUUIDCheck && !this.hasUUID(uuid)) {
                throw new TicketListAnswerError(`no pending ticket for uuid="${uuid}"`, uuid);
            }
            const ticket = this.pendingTickets[uuid];
            delete this.pendingTickets[uuid];
            ticket(answerValue);
        };
        this.pendingTickets = {};
        this.hasUUID = (uuid) => (uuid in this.pendingTickets);
        this.rejectTicket = (uuid, ignoreErrors = false) => {
            if (!this.hasUUID(uuid))
                return;
            const ticket = this.pendingTickets[uuid];
            delete this.pendingTickets[uuid];
            if (ignoreErrors === 'ignore errors') {
                try {
                    ticket(undefined, TicketList.TICKET_REJECTED);
                }
                catch (_a) { }
            }
            else {
                ticket(undefined, TicketList.TICKET_REJECTED);
            }
        };
        /**
         * Now it will reset on Number.MAX_SAFE_INTEGER and travel pendingTickets keys till found free uuid
         */
        this.nextUUID = (() => {
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
}
exports.TicketList = TicketList;
TicketList.TICKET_REJECTED = Symbol('TICKET_REJECTED');
