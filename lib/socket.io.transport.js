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
require("socket.io-client");
const config_1 = require("./config");
const ticket_list_1 = require("./ticket-list");
class SocketIOTransport {
    constructor(socket, config = config_1.DefaultConfig) {
        this.config = config_1.DefaultConfig;
        this.eventName = '';
        this.pending = new ticket_list_1.TicketList();
        this.setConfig(config);
        this.socket = socket;
        socket.on(this.eventName, (response) => __awaiter(this, void 0, void 0, function* () {
            if (this.config.debug)
                console.log('SocketIOTransport: onData', JSON.stringify(response, null, 2));
            if (this.pending.hasUUID(response.uuid)) {
                if (this.config.debug)
                    console.log('SocketIOTransport: found pending', response.uuid);
                this.pending.answer(response.uuid, response, 'no uuid check');
            }
            else {
                if (this.config.debug)
                    console.log('SocketIOTransport: forEach requestHandler');
                const resp = yield this.requestHandler(response.data);
                this.socket.emit(this.eventName, {
                    uuid: response.uuid,
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
        const { answer } = this.pending.ask(req.uuid);
        this.socket.emit(this.eventName, req);
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
        this.eventName = 'rpct-' + config.version;
        this.pending.nextUUID = this.config.uuidGeneratorFactory();
    }
}
exports.SocketIOTransport = SocketIOTransport;
