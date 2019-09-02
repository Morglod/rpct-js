"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const ticket_list_1 = require("./ticket-list");
class DuplexStreamTransport {
    constructor(stream, config = config_1.DefaultConfig, debugName = '') {
        this.debugName = debugName;
        this.config = config_1.DefaultConfig;
        this.pending = new ticket_list_1.TicketList();
        this.setConfig(config);
        this.stream = stream;
        stream.on('data', (msg) => __awaiter(this, void 0, void 0, function* () {
            if (this.config.debug) {
                console.log(`StreamIOTransport_${debugName} received message: "${JSON.stringify(msg)}"`);
            }
            if (typeof msg !== 'object')
                throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            const k = Object.keys(msg);
            // if (!k.includes('data')) throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            if (!k.includes('uuid'))
                throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            if (this.pending.hasUUID(msg.uuid)) {
                if (this.config.debug)
                    console.log(`StreamIOTransport_${debugName}: found pending`, msg.uuid);
                this.pending.answer(msg.uuid, msg, 'no uuid check');
            }
            else {
                if (this.config.debug)
                    console.log(`StreamIOTransport_${debugName}: forEach requestHandler`);
                const resp = yield this.requestHandler(msg.data);
                this.stream.write({
                    uuid: msg.uuid,
                    data: resp,
                });
            }
        }));
    }
    request(data) {
        const uuid = this.pending.nextUUID();
        const req = {
            uuid,
            data,
        };
        if (this.config.debug)
            console.log(`StreamIOTransport_${this.debugName}: making request`, data);
        const { answer } = this.pending.ask(req.uuid);
        this.stream.write(req);
        return answer;
    }
    setRequestHandler(handler) {
        this.requestHandler = handler;
    }
    getRequestHandler() {
        return this.requestHandler;
    }
    setConfig(config) {
        this.config = config;
        this.pending.nextUUID = this.config.uuidGeneratorFactory();
    }
}
exports.DuplexStreamTransport = DuplexStreamTransport;
