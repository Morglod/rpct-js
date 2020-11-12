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
const api_1 = require("../api");
const utils_1 = require("../streams/utils");
const duplex_stream_1 = require("../transports/duplex-stream");
const buffers_1 = require("../middlewares/buffers");
function remotePrintBuffer(buffer) {
    console.log('remote print buffer ', buffer);
    return buffer;
}
(function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const session = utils_1.simpleCrossStream();
        const localStreamTransport = new duplex_stream_1.DuplexStreamTransport(session.a, undefined, 'local');
        const localApi = new api_1.Api({}, localStreamTransport);
        yield localApi.addMiddleware(buffers_1.buffersMiddleware().middleware);
        const remoteStreamTransport = new duplex_stream_1.DuplexStreamTransport(session.b, undefined, 'remote');
        const remoteApi = new api_1.Api({
            remotePrintBuffer,
        }, remoteStreamTransport);
        yield remoteApi.addMiddleware(buffers_1.buffersMiddleware().middleware);
        const result = yield localApi.call('remotePrintBuffer', // Remote api method
        Buffer.from([255, 0, 0, 255]));
        console.log('result', result);
    });
})();
