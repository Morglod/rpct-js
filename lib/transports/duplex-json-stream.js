"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplexJsonStreamTransport = void 0;
const config_1 = require("../config");
const itransport_1 = require("../transports/itransport");
const ticket_list_1 = require("../utils/ticket-list");
class DuplexJsonStreamTransport {
    constructor(stream, config = config_1.DefaultConfig, debugName = '') {
        this.debugName = debugName;
        this.config = config_1.DefaultConfig;
        this.pending = new ticket_list_1.TicketList();
        this.setConfig(config);
        this.stream = stream;
        stream.on('data', (chunk) => __awaiter(this, void 0, void 0, function* () {
            let jsonStr;
            if (chunk instanceof Uint8Array) {
                jsonStr = chunk.toString();
            }
            else if (typeof chunk === 'object') {
                jsonStr = chunk;
            }
            else {
                jsonStr = `${chunk}`;
            }
            if (this.config.debug) {
                console.log(`StreamIOTransport_${debugName} received message: "${jsonStr}"`);
            }
            let chunkProtocol = chunk;
            try {
                if (typeof jsonStr === 'string')
                    chunkProtocol = JSON.parse(jsonStr);
            }
            catch (err) {
                throw err;
            }
            if (typeof chunkProtocol !== 'object')
                throw new Error(`StreamIOTransport_${debugName} wrong message type; should be object`);
            const k = Object.keys(chunkProtocol);
            // if (!k.includes('data')) throw new Error(`StreamIOTransport_${debugName} wrong message type`);
            if (!k.includes('uuid'))
                throw new Error(`StreamIOTransport_${debugName} wrong message type; should have uuid`);
            if (this.pending.hasUUID(chunkProtocol.uuid)) {
                if (this.config.debug)
                    console.log(`StreamIOTransport_${debugName}: found pending`, chunkProtocol.uuid);
                if (itransport_1.isTransportProtocolReturnable(chunkProtocol)) {
                    this.pending.answer(chunkProtocol.uuid, chunkProtocol, 'no uuid check');
                }
                else {
                    throw new Error(`StreamIOTransport_${debugName}: msg should be returnable`);
                }
            }
            else {
                if (this.config.debug)
                    console.log(`StreamIOTransport_${debugName}: forEach requestHandler`);
                if ('api' in chunkProtocol) {
                    const resp = yield this.requestHandler(chunkProtocol.api);
                    this.stream.write(JSON.stringify(Object.assign(resp, {
                        uuid: chunkProtocol.uuid,
                    })));
                }
                else {
                    throw new Error(`StreamIOTransport_${debugName}: chunkProtocol without .api`);
                }
            }
        }));
    }
    request(data) {
        const uuid = this.pending.nextUUID();
        const req = {
            uuid,
            api: data,
        };
        if (this.config.debug)
            console.log(`StreamIOTransport_${this.debugName}: making request`, data);
        const { answer } = this.pending.ask(req.uuid);
        this.stream.write(JSON.stringify(req));
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
exports.DuplexJsonStreamTransport = DuplexJsonStreamTransport;
