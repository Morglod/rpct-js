"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/** Error with uuid field */
var TicketListAnswerError = /** @class */ (function (_super) {
    __extends(TicketListAnswerError, _super);
    function TicketListAnswerError(message, uuid) {
        var _this = _super.call(this, message) || this;
        _this.uuid = uuid;
        return _this;
    }
    return TicketListAnswerError;
}(Error));
exports.TicketListAnswerError = TicketListAnswerError;
/**
 * ask->Promise<uuid, answer> solver
 */
var TicketList = /** @class */ (function () {
    function TicketList() {
        var _this = this;
        /** uuid=null to use TicketList.nextUUID */
        this.ask = function (uuid) {
            var _uuid = (uuid === null) ? _this.nextUUID() : uuid;
            var answerPromise = new Promise(function (resolve, reject) {
                _this.pendingTickets[_uuid] = function (answer, error) {
                    if (answer || !error) {
                        delete _this.pendingTickets[_uuid];
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
        this.answer = function (uuid, answerValue, noUUIDCheck) {
            if (noUUIDCheck === void 0) { noUUIDCheck = false; }
            if (!noUUIDCheck && !_this.hasUUID(uuid)) {
                throw new TicketListAnswerError("no pending ticket for uuid=\"" + uuid + "\"", uuid);
            }
            var ticket = _this.pendingTickets[uuid];
            delete _this.pendingTickets[uuid];
            ticket(answerValue);
        };
        this.pendingTickets = {};
        this.hasUUID = function (uuid) { return (uuid in _this.pendingTickets); };
        this.rejectTicket = function (uuid, ignoreErrors) {
            if (ignoreErrors === void 0) { ignoreErrors = false; }
            if (!_this.hasUUID(uuid))
                return;
            var ticket = _this.pendingTickets[uuid];
            delete _this.pendingTickets[uuid];
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
         * You should use uuidv4+ for heavy rpc services
         * Now it will reset on Number.MAX_SAFE_INTEGER and travel pendingTickets keys till found free uuid
         */
        this.nextUUID = (function () {
            var counter = 0;
            return function () {
                if (counter >= Number.MAX_SAFE_INTEGER - 5) {
                    counter = 0;
                }
                do {
                    counter++;
                } while (_this.hasUUID(counter));
                return counter;
            };
        })();
    }
    TicketList.TICKET_REJECTED = Symbol('TICKET_REJECTED');
    return TicketList;
}());
exports.TicketList = TicketList;
