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
const config_1 = require("../config");
const ticket_list_1 = require("../utils/ticket-list");
const istream_1 = require("../streams/istream");
class StreamTransport {
    constructor(rstream, wstream, config = config_1.DefaultConfig, debugName = '') {
        this.debugName = debugName;
        this.config = config_1.DefaultConfig;
        this.pending = new ticket_list_1.TicketList();
        this.rstream = istream_1.asReadableStream(rstream);
        this.wstream = istream_1.asWritableStream(wstream);
        this.setConfig(config);
        this.rstream.on('data', (msg) => __awaiter(this, void 0, void 0, function* () {
            if (this.config.debug) {
                console.log(`StreamIOTransport_${debugName} onData: "${JSON.stringify(msg)}"`);
            }
            if (typeof msg !== 'object')
                throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            const k = Object.keys(msg);
            // if (!k.includes('data')) throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            if (!k.includes('uuid'))
                throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            if (this.pending.hasUUID(msg.uuid)) {
                if (this.config.debug)
                    console.log(`StreamIOTransport_${debugName}: found pending, answering pending ticket uuid="${msg.uuid}"`);
                this.pending.answer(msg.uuid, msg, 'no uuid check');
            }
            else {
                if (this.config.debug)
                    console.log(`StreamIOTransport_${debugName}: no pending ticket with this uuid="${msg.uuid}", calling requestHandler`);
                const resp = yield this.requestHandler(msg.data);
                if (this.config.debug)
                    console.log(`StreamIOTransport_${debugName}: requestHandler for uuid="${msg.uuid}", answered data: "${JSON.stringify(resp)}"`);
                this.wstream.write(Object.assign(resp, {
                    uuid: msg.uuid,
                }));
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
            console.log(`StreamIOTransport_${this.debugName}: making request with uuid="${uuid}", data="${JSON.stringify(data)}", new pending ticket`);
        const { answer } = this.pending.ask(req.uuid);
        this.wstream.write(req);
        return answer.catch(err => ({
            data: undefined,
            exception: `${err}`,
        }));
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
exports.StreamTransport = StreamTransport;
