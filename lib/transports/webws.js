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
const itransport_1 = require("./itransport");
const ticket_list_1 = require("../utils/ticket-list");
class WebWSTransport {
    constructor(socket, config = config_1.DefaultConfig, debugName = '') {
        this.debugName = debugName;
        this.config = config_1.DefaultConfig;
        this.pending = new ticket_list_1.TicketList();
        this.setConfig(config);
        this.socket = socket;
        socket.addEventListener('message', (ev) => __awaiter(this, void 0, void 0, function* () {
            const msg = JSON.parse(ev.data);
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
                if (itransport_1.isTransportProtocolReturnable(msg)) {
                    this.pending.answer(msg.uuid, msg, 'no uuid check');
                }
                else {
                    throw new Error(`StreamIOTransport_${debugName}: msg should be returnable`);
                }
            }
            else {
                if (this.config.debug)
                    console.log(`StreamIOTransport_${debugName}: no pending ticket with this uuid="${msg.uuid}", calling requestHandler`);
                if (itransport_1.isTransportProtocolApi(msg)) {
                    const resp = yield this.requestHandler(msg.api);
                    if (this.config.debug)
                        console.log(`StreamIOTransport_${debugName}: requestHandler for uuid="${msg.uuid}", answered data: "${JSON.stringify(resp)}"`);
                    this.socket.send(JSON.stringify(Object.assign(resp, {
                        uuid: msg.uuid,
                    })));
                }
                else {
                    throw new Error(`StreamIOTransport_${debugName}: msg should has api`);
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
        const { answer } = this.pending.ask(req.uuid);
        this.socket.send(JSON.stringify(req));
        return answer.catch(err => ({
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
exports.WebWSTransport = WebWSTransport;
